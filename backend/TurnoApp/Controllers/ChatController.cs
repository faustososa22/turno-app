using Anthropic.SDK;
using Anthropic.SDK.Common;
using Anthropic.SDK.Constants;
using Anthropic.SDK.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Nodes;
using TurnoApp.Services;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly ITurnoService _turnoService;
    private readonly IConfiguration _config;

    private static readonly Dictionary<int, List<DateTime>> _requestLog = new();
    private static readonly object _lock = new();
    private const int MaxRequestsPerHour = 15;

    public ChatController(ITurnoService turnoService, IConfiguration config)
    {
        _turnoService = turnoService;
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
                    var result = await ExecuteTool(toolCall.Name, toolCall.Arguments, userId);
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

    private async Task<string> ExecuteTool(string toolName, JsonNode? args, int userId)
    {
        switch (toolName)
        {
            case "get_barberos":
            {
                var barberos = await _turnoService.GetBarberosAsync();
                return JsonSerializer.Serialize(barberos);
            }

            case "get_servicios":
            {
                var barberoId = args!["barbero_id"]!.GetValue<int>();
                var servicios = await _turnoService.GetServiciosAsync(barberoId);
                return JsonSerializer.Serialize(servicios);
            }

            case "get_huecos":
            {
                var barberoId = args!["barbero_id"]!.GetValue<int>();
                var fecha = DateTime.Parse(args["fecha"]!.GetValue<string>());
                var duracion = args["duracion_minutos"]!.GetValue<int>();
                var result = await _turnoService.GetHuecosAsync(barberoId, fecha, duracion);
                return JsonSerializer.Serialize(new
                {
                    available = result.Available,
                    available_slots = result.AvailableSlots,
                    actual_date = result.ActualDate,
                    actual_day_of_week = result.ActualDayOfWeek,
                    message = result.Message
                });
            }

            case "crear_turno":
            {
                var barberoId = args!["barbero_id"]!.GetValue<int>();
                var servicioBaseId = args["servicio_base_id"]!.GetValue<int>();
                var fechaHoraStr = args["fecha_hora"]!.GetValue<string>();

                var addonIds = new List<int>();
                if (args["addon_ids"] is JsonArray addonsArr)
                    addonIds = addonsArr.Select(e => e!.GetValue<int>()).ToList();

                var result = await _turnoService.CrearTurnoAsync(barberoId, servicioBaseId, addonIds, fechaHoraStr, userId);
                return result.Success
                    ? JsonSerializer.Serialize(new { success = true, turno_id = result.TurnoId })
                    : JsonSerializer.Serialize(new { success = false, error = result.Error });
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
