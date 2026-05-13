using Anthropic.SDK;
using Anthropic.SDK.Common;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;
using TurnoApp.Data;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    // Rate limiting: max 10 requests per user per hour
    private static readonly Dictionary<int, List<DateTime>> _requestLog = new();
    private static readonly object _lock = new();
    private const int MaxRequestsPerHour = 15;

    public ChatController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    private int GetUserId()
    {
        var claim = User.Claims.FirstOrDefault(c =>
            c.Type.Contains("nameidentifier") || c.Type.EndsWith("nameidentifier"));
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private bool IsRateLimited(int userId)
    {
        var now = DateTime.UtcNow;
        var oneHourAgo = now.AddHours(-1);
        lock (_lock)
        {
            if (!_requestLog.ContainsKey(userId))
                _requestLog[userId] = new List<DateTime>();

            // Remove requests older than 1 hour
            _requestLog[userId].RemoveAll(t => t < oneHourAgo);

            if (_requestLog[userId].Count >= MaxRequestsPerHour)
                return true;

            _requestLog[userId].Add(now);
            return false;
        }
    }

    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDTO dto)
    {
        var userId = GetUserId();
        if (IsRateLimited(userId))
            return StatusCode(429, new { message = "Too many requests. Please wait before sending more messages." });

        var apiKey = _config["Anthropic:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return StatusCode(503, new { message = "Chat service not configured" });

        var client = new AnthropicClient(apiKey);

        var messages = dto.Messages
            .Select(m => new Message(
                m.Role == "user" ? RoleType.User : RoleType.Assistant,
                m.Content))
            .ToList();

        var tools = BuildTools();
        var systemPrompt = $@"You are a booking assistant for a barbershop. Today's date is {DateTime.UtcNow:yyyy-MM-dd}.

BOOKING WORKFLOW — follow this exact order:
1. Call get_barberos → show the list, ask client to choose.
2. Call get_servicios for that barber → show services, ask client to choose a base service (and optional add-ons).
3. Ask the client for their preferred date.
4. Call get_huecos → inspect the result carefully before doing anything else.
5. If and only if step 4 returned available slots, show them to the client and ask them to pick one.
6. Once the client picks a slot, call crear_turno.

RULES YOU MUST NEVER BREAK:
- After calling get_huecos, READ the tool result carefully:
  - The result always includes ""actual_date"" and ""actual_day_of_week"" — these are the REAL values from the server. Use them, not your own calculation.
  - If ""available_slots"" is empty OR ""available"" is false → tell the client there are no slots on that day (use actual_day_of_week from the result) and ask them to pick another date. STOP. Do NOT call crear_turno.
  - If ""available_slots"" has times → show them to the client. Do NOT invent slots.
- When passing ""fecha_hora"" to crear_turno, use the ""actual_date"" from get_huecos plus the time the client chose. Example: if actual_date is ""2026-05-19"" and client chose ""10:00"", pass ""2026-05-19T10:00:00"".
- NEVER call crear_turno unless get_huecos returned at least one slot in ""available_slots"".
- NEVER tell the client their appointment is confirmed unless crear_turno returned ""success"": true.
- If crear_turno returns ""success"": false, tell the client the booking failed and show the error.

Be concise and friendly.";

        var parameters = new MessageParameters
        {
            Messages = messages,
            MaxTokens = 1024,
            Model = AnthropicModels.Claude45Haiku,
            Stream = false,
            Temperature = 1.0m,
            System = new List<SystemMessage> { new SystemMessage(systemPrompt) },
            Tools = tools
        };

        // Tool use loop: Claude calls tools until it has a final text answer
        MessageResponse response;
        do
        {
            response = await client.Messages.GetClaudeMessageAsync(parameters);
            messages.Add(response.Message);

            if (response.ToolCalls?.Any() == true)
            {
                var toolResults = new List<ContentBase>();
                foreach (var toolCall in response.ToolCalls)
                {
                    var result = await ExecuteTool(toolCall.Name, toolCall.Arguments);
                    toolResults.Add(new ToolResultContent
                    {
                        ToolUseId = toolCall.Id,
                        Content = new List<ContentBase> { new TextContent { Text = result } }
                    });
                }
                messages.Add(new Message { Role = RoleType.User, Content = toolResults });
                parameters.Messages = messages;
            }
        }
        while (response.StopReason == "tool_use");

        return Ok(new { reply = response.Message.ToString() });
    }

    private async Task<string> ExecuteTool(string toolName, JsonNode? args)
    {
        switch (toolName)
        {
            case "get_barberos":
            {
                var barberos = await _context.Barberos
                    .Where(b => b.Activo)
                    .Select(b => new { b.Id, nombre = b.Nombre + " " + b.Apellido })
                    .ToListAsync();
                return JsonSerializer.Serialize(barberos);
            }

            case "get_servicios":
            {
                var barberoId = args!["barbero_id"]!.GetValue<int>();
                var servicios = await _context.BarberoServicios
                    .Where(bs => bs.BarberoId == barberoId && bs.Servicio.Activo)
                    .Select(bs => new
                    {
                        bs.Servicio.Id,
                        bs.Servicio.Nombre,
                        bs.Servicio.Tipo,
                        bs.Servicio.DuracionMinutos,
                        bs.Servicio.Precio
                    })
                    .ToListAsync();
                return JsonSerializer.Serialize(servicios);
            }

            case "get_huecos":
            {
                var barberoId = args!["barbero_id"]!.GetValue<int>();
                var fecha = DateTime.Parse(args["fecha"]!.GetValue<string>());
                var duracion = args["duracion_minutos"]!.GetValue<int>();

                var timezoneId = _config["Barberia:TimeZone"];
                var timezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId!);

                var horario = await _context.HorariosDisponibles
                    .FirstOrDefaultAsync(h => h.BarberoId == barberoId && h.DiaSemana == fecha.DayOfWeek && h.Activo);

                var actualDayName = fecha.DayOfWeek.ToString();

                if (horario == null)
                    return JsonSerializer.Serialize(new
                    {
                        available = false,
                        available_slots = Array.Empty<string>(),
                        actual_date = fecha.ToString("yyyy-MM-dd"),
                        actual_day_of_week = actualDayName,
                        message = $"The barber does not work on {actualDayName}s. available_slots is empty. DO NOT book. Tell the client there are no slots on {actualDayName} {fecha:yyyy-MM-dd} and ask them to pick another date."
                    });

                var turnos = await _context.Turnos
                    .Where(t => t.BarberoId == barberoId && t.Estado != "cancelado")
                    .Select(t => new { t.FechaHora, t.FechaHoraFin })
                    .ToListAsync();

                var huecos = new List<string>();
                var hora = horario.HoraInicio;
                while (hora.AddMinutes(duracion) <= horario.HoraFin)
                {
                    var slotLocal = new DateTime(fecha.Year, fecha.Month, fecha.Day, hora.Hour, hora.Minute, 0, DateTimeKind.Unspecified);
                    var slotUtc = TimeZoneInfo.ConvertTimeToUtc(slotLocal, timezone);
                    var slotFinUtc = slotUtc.AddMinutes(duracion);
                    var disponible = !turnos.Any(t => t.FechaHora < slotFinUtc && t.FechaHoraFin > slotUtc);
                    if (disponible) huecos.Add(hora.ToString("HH:mm"));
                    hora = hora.AddMinutes(15);
                }
                return JsonSerializer.Serialize(new
                {
                    available_slots = huecos,
                    actual_date = fecha.ToString("yyyy-MM-dd"),
                    actual_day_of_week = actualDayName
                });
            }

            case "crear_turno":
            {
                var usuarioId = GetUserId();
                var barberoId = args!["barbero_id"]!.GetValue<int>();
                var servicioBaseId = args["servicio_base_id"]!.GetValue<int>();
                var fechaHoraStr = args["fecha_hora"]!.GetValue<string>();

                var addonIds = new List<int>();
                if (args["addon_ids"] is JsonArray addonsArr)
                    addonIds = addonsArr.Select(e => e!.GetValue<int>()).ToList();

                var todosIds = new List<int> { servicioBaseId };
                todosIds.AddRange(addonIds);

                var servicios = await _context.Servicios
                    .Where(s => todosIds.Contains(s.Id))
                    .ToListAsync();

                var tz = TimeZoneInfo.FindSystemTimeZoneById(_config["Barberia:TimeZone"]!);
                var fechaLocal = DateTime.Parse(fechaHoraStr);
                var fechaUtc = TimeZoneInfo.ConvertTimeToUtc(fechaLocal, tz);
                var totalMin = servicios.Sum(s => s.DuracionMinutos);
                var totalPrecio = servicios.Sum(s => s.Precio);
                var fechaFinUtc = fechaUtc.AddMinutes(totalMin);

                // Validate: barber has a schedule for this day
                var horario = await _context.HorariosDisponibles
                    .FirstOrDefaultAsync(h => h.BarberoId == barberoId && h.DiaSemana == fechaLocal.DayOfWeek && h.Activo);

                if (horario == null)
                    return JsonSerializer.Serialize(new { success = false, error = "The barber has no schedule on that day. Cannot create the appointment." });

                // Validate: slot fits within the schedule block
                var slotTime = new TimeOnly(fechaLocal.Hour, fechaLocal.Minute);
                var slotEnd = slotTime.AddMinutes(totalMin);
                if (slotTime < horario.HoraInicio || slotEnd > horario.HoraFin)
                    return JsonSerializer.Serialize(new { success = false, error = "The requested time slot is outside the barber's working hours." });

                // Validate: no conflict with existing appointments
                var conflict = await _context.Turnos
                    .AnyAsync(t => t.BarberoId == barberoId && t.Estado != "cancelado"
                                   && t.FechaHora < fechaFinUtc && t.FechaHoraFin > fechaUtc);

                if (conflict)
                    return JsonSerializer.Serialize(new { success = false, error = "That time slot is no longer available. Please choose another." });

                var turno = new TurnoApp.Models.Turno
                {
                    FechaHora = fechaUtc,
                    FechaHoraFin = fechaFinUtc,
                    BarberoId = barberoId,
                    UsuarioId = usuarioId,
                    ServicioId = servicioBaseId,
                    PrecioTotal = totalPrecio
                };
                _context.Turnos.Add(turno);
                await _context.SaveChangesAsync();

                foreach (var sId in todosIds)
                    _context.TurnoServicios.Add(new TurnoApp.Models.TurnoServicio { TurnoId = turno.Id, ServicioId = sId });
                await _context.SaveChangesAsync();

                return JsonSerializer.Serialize(new { success = true, turno_id = turno.Id });
            }

            default:
                return JsonSerializer.Serialize(new { error = "Unknown tool" });
        }
    }

    private static IList<Anthropic.SDK.Common.Tool> BuildTools()
    {
        var tools = new List<Anthropic.SDK.Common.Tool>();

        tools.Add(new Anthropic.SDK.Common.Tool(new Function(
            "get_barberos",
            "Get the list of available barbers",
            JsonNode.Parse(@"{""type"":""object"",""properties"":{},""required"":[]}")!)));

        tools.Add(new Anthropic.SDK.Common.Tool(new Function(
            "get_servicios",
            "Get services offered by a specific barber",
            JsonNode.Parse(@"{""type"":""object"",""properties"":{""barbero_id"":{""type"":""integer"",""description"":""The barber ID""}},""required"":[""barbero_id""]}")!)));

        tools.Add(new Anthropic.SDK.Common.Tool(new Function(
            "get_huecos",
            "Get available time slots for a barber on a specific date",
            JsonNode.Parse(@"{""type"":""object"",""properties"":{""barbero_id"":{""type"":""integer""},""fecha"":{""type"":""string"",""description"":""Date in YYYY-MM-DD format""},""duracion_minutos"":{""type"":""integer"",""description"":""Total duration in minutes""}},""required"":[""barbero_id"",""fecha"",""duracion_minutos""]}")!)));

        tools.Add(new Anthropic.SDK.Common.Tool(new Function(
            "crear_turno",
            "Create a new appointment for the logged-in client",
            JsonNode.Parse(@"{""type"":""object"",""properties"":{""barbero_id"":{""type"":""integer""},""servicio_base_id"":{""type"":""integer""},""addon_ids"":{""type"":""array"",""items"":{""type"":""integer""}},""fecha_hora"":{""type"":""string"",""description"":""ISO format: 2026-05-12T10:00:00""}},""required"":[""barbero_id"",""servicio_base_id"",""fecha_hora""]}")!)));

        return tools;
    }
}

public class ChatRequestDTO
{
    public List<ChatMessageDTO> Messages { get; set; } = [];
}

public class ChatMessageDTO
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
