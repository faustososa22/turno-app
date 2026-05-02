using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoApp.Data;
using TurnoApp.DTOs;
using TurnoApp.Models;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TurnosController : ControllerBase
{
    private readonly AppDbContext context;

    public TurnosController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetTurnos()
    {
        var turnos = await context.Turnos
            .Where(t => t.FechaHora >= DateTime.UtcNow)
            .Select( t => new
            {
                FechaHora = t.FechaHora,
                Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
                Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
                Estado = t.Estado,
                Servicio = t.Servicio.Nombre
            }).ToListAsync();
        return Ok(turnos);
    }

    [HttpGet("barbero/{barberoId}")]
    [Authorize(Roles = "admin,barbero")]
    public async Task<IActionResult> GetTurnosByBarbero(int barberoId)
    {
        var turnos = await context.Turnos
            .Where(t => t.BarberoId == barberoId && t.FechaHora >= DateTime.UtcNow)
            .Select(t => new
            {
                FechaHora = t.FechaHora,
                Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
                Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
                Estado = t.Estado,
                Servicio = t.Servicio.Nombre
            }).ToListAsync();
        return Ok(turnos);
    }

    [HttpGet("cliente/{clienteId}")]
    [Authorize(Roles = "admin,cliente")]
    public async Task<IActionResult> GetTurnosByCliente(int clienteId)
    {
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var esAdmin = User.IsInRole("admin");
        if (!esAdmin && clienteId != usuarioId)        
        {
            return Forbid();
        }
        var turnos = await context.Turnos
            .Where(t => t.UsuarioId == clienteId && t.FechaHora >= DateTime.UtcNow)
            .Select(t => new
            {
                FechaHora = t.FechaHora,
                Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
                Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
                Estado = t.Estado,
                Servicio = t.Servicio.Nombre
            }).ToListAsync();
        return Ok(turnos);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateTurno([FromBody] TurnoDTO turno)
    {
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var barberoExiste = await context.Barberos.AnyAsync(b => b.Id == turno.BarberoId && b.Activo);
        if (!barberoExiste) return BadRequest("El barbero seleccionado no existe o no está activo.");

        // Validar que el turno no se solape con otro turno del mismo barbero
        var solapamientoBarbero = await context.Turnos.AnyAsync(t =>
            t.BarberoId == turno.BarberoId &&
            t.FechaHora == turno.FechaHora);
        
        var barberoDisponible = await context.HorariosDisponibles.AnyAsync(h =>
            h.BarberoId == turno.BarberoId &&
            h.DiaSemana == turno.FechaHora.DayOfWeek &&
            h.HoraInicio <= TimeOnly.FromTimeSpan(turno.FechaHora.TimeOfDay) &&
            h.HoraFin > TimeOnly.FromTimeSpan(turno.FechaHora.TimeOfDay));
        
        if (!barberoDisponible) return BadRequest("El barbero no está disponible en ese horario.");
    

        if (solapamientoBarbero)
        {
            return BadRequest("El barbero ya tiene un turno en ese horario.");
        }


        //Verificar que el cliente no tenga otro turno en el mismo horario
        var solapamientoUsuario = await context.Turnos.AnyAsync(t =>
            t.UsuarioId == usuarioId &&
            t.FechaHora == turno.FechaHora);

        if (solapamientoUsuario)
        {
            return BadRequest("El cliente ya tiene un turno en ese horario.");
        }

        var servicio = await context.Servicios.FindAsync(turno.ServicioId);
        if (servicio == null) return BadRequest("El servicio seleccionado no existe.");

        if (servicio.DuracionMinutos <= 0) return BadRequest("La duración del servicio debe ser mayor a cero.");

        var nuevoTurno = new Turno
        {
            FechaHora = turno.FechaHora,
            FechaHoraFin = turno.FechaHora.AddMinutes(servicio.DuracionMinutos),
            BarberoId = turno.BarberoId,
            UsuarioId = usuarioId,
            ServicioId = turno.ServicioId
        };

        context.Turnos.Add(nuevoTurno);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTurnos), new { id = nuevoTurno.Id }, nuevoTurno);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,cliente")]
    public async Task<IActionResult> DeleteTurno(int id)
    {
        var turno = await context.Turnos.FindAsync(id);
        if (turno == null) return NotFound();
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var esAdmin = User.IsInRole("admin");
        if (!esAdmin && turno.UsuarioId != usuarioId)
        {
            return Forbid();
        }

        turno.Estado = "cancelado";
        await context.SaveChangesAsync();
        return NoContent();
    }
}