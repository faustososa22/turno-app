using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoApp.Data;
using TurnoApp.DTOs;
using TurnoApp.Models;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HorariosController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly IConfiguration configuration;

    public HorariosController(AppDbContext context, IConfiguration configuration)
    {
        this.context = context;
        this.configuration = configuration;
    }

    [HttpGet("disponibles")]
    [Authorize]
    public async Task<ActionResult> GetHorariosDisponibles([FromQuery]DateTime fecha)
    {
        var diaSemana = fecha.DayOfWeek;

        var horarios = await context.HorariosDisponibles
            .Where(h => h.DiaSemana == diaSemana && h.Activo)
            .Select(h => new
            {
                h.Id,
                h.DiaSemana,
                h.HoraInicio,
                h.HoraFin,
                BarberoId = h.Barbero.Id,
                BarberoNombre = h.Barbero.Nombre + " " + h.Barbero.Apellido
            })
            .ToListAsync();

        return Ok(horarios);
    }

    [HttpGet("huecos")]
    public async Task<ActionResult> GetHuecosDisponibles(
        [FromQuery] int barberoId,
        [FromQuery] int anio,
        [FromQuery] int mes,
        [FromQuery] int dia,
        [FromQuery] int duracionMinutos)
    {
        var diaSemana = (DayOfWeek)(((int)new DateTime(anio, mes, dia).DayOfWeek));

        var horario = await context.HorariosDisponibles
            .Where(h => h.BarberoId == barberoId && h.DiaSemana == diaSemana && h.Activo)
            .FirstOrDefaultAsync();

        if (horario == null)
            return Ok(new List<HuecoDisponibleDTO>());

        var todosTurnos = await context.Turnos
            .Where(t => t.BarberoId == barberoId && t.Estado != "cancelado")
            .Select(t => new { t.FechaHora, t.FechaHoraFin })
            .ToListAsync();
        var timezoneId = configuration["Barberia:TimeZone"];
        var timezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId!);
        
        var huecos = new List<HuecoDisponibleDTO>();
        var horaActual = horario.HoraInicio;
        var slotIntervalo = 15;

        var ahoraUtc = DateTime.UtcNow;
        var ahoraLocal = TimeZoneInfo.ConvertTimeFromUtc(ahoraUtc, timezone);

        while (horaActual.AddMinutes(duracionMinutos) <= horario.HoraFin)
        {
            var fechaHoraSlot = new DateTime(anio, mes, dia, horaActual.Hour, horaActual.Minute, 0, DateTimeKind.Unspecified);
            var fechaHoraSlotUtc = TimeZoneInfo.ConvertTimeToUtc(fechaHoraSlot, timezone);
            var fechaFinServicioUtc = fechaHoraSlotUtc.AddMinutes(duracionMinutos);

            bool disponible = !todosTurnos.Any(t =>
                t.FechaHora < fechaFinServicioUtc && t.FechaHoraFin > fechaHoraSlotUtc);

            bool esHoy = anio == ahoraLocal.Year && mes == ahoraLocal.Month && dia == ahoraLocal.Day;
            bool yaPaso = esHoy && horaActual.ToTimeSpan() <= ahoraLocal.TimeOfDay;

            if (!yaPaso)
            {
                huecos.Add(new HuecoDisponibleDTO
                {
                    Hora = horaActual.ToString("HH:mm"),
                    Disponible = disponible
                });
            }

            horaActual = horaActual.AddMinutes(slotIntervalo);
        }

        return Ok(huecos);
    }

    [HttpGet("barbero/{barberoId}")]
    [Authorize]
    // Devuelve los horarios disponibles para un barbero específico
    public async Task<ActionResult> GetHorariosPorBarbero(int barberoId)
    {
        var horarios = await context.HorariosDisponibles
            .Where(h => h.BarberoId == barberoId && h.Activo)
            .Select(h => new
            {
                h.Id,
                h.DiaSemana,
                h.HoraInicio,
                h.HoraFin
            })
            .ToListAsync();

        return Ok(horarios);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    // Agrega un nuevo horario disponible para un barbero
    public async Task<ActionResult> AgregarHorario([FromBody] HorarioDisponibleDTO dto)
    {
        var barbero = await context.Barberos.FindAsync(dto.BarberoId);

        if (barbero == null)
            return NotFound("Barber not found");

        var horarioExiste = await context.HorariosDisponibles
            .AnyAsync(h => h.BarberoId == dto.BarberoId && h.DiaSemana == dto.DiaSemana &&
                           ((dto.HoraInicio >= h.HoraInicio && dto.HoraInicio < h.HoraFin) ||
                            (dto.HoraFin > h.HoraInicio && dto.HoraFin <= h.HoraFin)));
        if (horarioExiste)
            return BadRequest("A schedule already exists for this barber and day");

        if (dto.HoraInicio >= dto.HoraFin)
            return BadRequest("Start time must be earlier than end time");

        var horario = new HorarioDisponible
        {
            DiaSemana = dto.DiaSemana,
            HoraInicio = dto.HoraInicio,
            HoraFin = dto.HoraFin,
            BarberoId = dto.BarberoId
        };

        context.HorariosDisponibles.Add(horario);
        await context.SaveChangesAsync();

        return Ok(new { horario.Id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    // Actualiza un horario disponible existente
    public async Task<IActionResult> ActualizarHorario(int id, [FromBody] HorarioDisponibleDTO dto)
    {
        var horario = await context.HorariosDisponibles.FindAsync(id);
        if (horario == null) return NotFound("Schedule not found");

        if (dto.HoraInicio >= dto.HoraFin) return BadRequest("La hora de inicio debe ser menor que la hora de fin");
        horario.DiaSemana = dto.DiaSemana;
        horario.HoraInicio = dto.HoraInicio;
        horario.HoraFin = dto.HoraFin;
        horario.BarberoId = dto.BarberoId;

        await context.SaveChangesAsync();
        return Ok(horario);

    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> EliminarHorario(int id)
    {
        var horario = await context.HorariosDisponibles.FindAsync(id);
        if (horario == null) return NotFound("Schedule not found");

        // En lugar de eliminar físicamente, marcamos como inactivo
        horario.Activo = false;
        await context.SaveChangesAsync();
        return NoContent();
    }
}