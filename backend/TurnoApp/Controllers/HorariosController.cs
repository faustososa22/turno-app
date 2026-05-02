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

    public HorariosController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet("disponibles")]
    [Authorize]
    // Devuelve los horarios disponibles para una fecha específica
    public async Task<ActionResult> GetHorariosDisponibles([FromQuery]DateTime fecha)
    {
        var diaSemana = fecha.DayOfWeek;

        // Obtener los horarios disponibles para el día de la semana
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
            return NotFound("Barbero no encontrado");

        var horarioExiste = await context.HorariosDisponibles
            .AnyAsync(h => h.BarberoId == dto.BarberoId && h.DiaSemana == dto.DiaSemana &&
                           ((dto.HoraInicio >= h.HoraInicio && dto.HoraInicio < h.HoraFin) ||
                            (dto.HoraFin > h.HoraInicio && dto.HoraFin <= h.HoraFin)));
        if (horarioExiste)
            return BadRequest("El horario ya existe para este barbero y día");

        if (dto.HoraInicio >= dto.HoraFin)
            return BadRequest("La hora de inicio debe ser menor que la hora de fin");

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
        if (horario == null) return NotFound("Horario no encontrado");

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
        if (horario == null) return NotFound("Horario no encontrado");

        // En lugar de eliminar físicamente, marcamos como inactivo
        horario.Activo = false;
        await context.SaveChangesAsync();
        return NoContent();
    }
}