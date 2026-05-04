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
    private readonly IConfiguration _config;

    public TurnosController(AppDbContext context, IConfiguration config)
    {
        this.context = context;
        this._config = config;
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
    public async Task<IActionResult> CreateTurno([FromBody] CrearTurnoDTO dto)
    {
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        var barberoExiste = await context.Barberos.AnyAsync(b => b.Id == dto.BarberoId && b.Activo);
        if (!barberoExiste) return BadRequest("El barbero seleccionado no existe o no está activo.");

        var servicioBase = await context.Servicios.FindAsync(dto.ServicioBaseId);
        if (servicioBase == null) return BadRequest("El servicio base seleccionado no existe.");

        var todosLosServiciosIds = new List<int> { dto.ServicioBaseId };
        todosLosServiciosIds.AddRange(dto.AddonIds);

        var servicios = await context.Servicios
            .Where(s => todosLosServiciosIds.Contains(s.Id))
            .ToListAsync();

        if (servicios.Count != todosLosServiciosIds.Count)
            return BadRequest("Algunos servicios no existen.");

        var duracionTotal = servicios.Sum(s => s.DuracionMinutos);
        var precioTotal = servicios.Sum(s => s.Precio);

        var timezoneId = _config["Barberia:TimeZone"];
        var timezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId!);
        
        var fechaRecibida = DateTime.Parse(dto.FechaHora);
        var fechaHora = TimeZoneInfo.ConvertTimeToUtc(fechaRecibida, timezone);
        var fechaFinTurno = fechaHora.AddMinutes(duracionTotal);

        var nuevoTurno = new Turno
        {
            FechaHora = fechaHora,
            FechaHoraFin = fechaFinTurno,
            BarberoId = dto.BarberoId,
            UsuarioId = usuarioId,
            ServicioId = dto.ServicioBaseId
        };

        context.Turnos.Add(nuevoTurno);
        await context.SaveChangesAsync();

        foreach (var servicio in servicios)
        {
            var turnoServicio = new TurnoServicio
            {
                TurnoId = nuevoTurno.Id,
                ServicioId = servicio.Id
            };
            context.TurnoServicios.Add(turnoServicio);
        }

        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTurnos), new { id = nuevoTurno.Id }, new
        {
            nuevoTurno.Id,
            nuevoTurno.FechaHora,
            nuevoTurno.FechaHoraFin,
            DuracionMinutos = duracionTotal,
            PrecioTotal = precioTotal,
            Servicios = servicios.Select(s => s.Nombre).ToList()
        });
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