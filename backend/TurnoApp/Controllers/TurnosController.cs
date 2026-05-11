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

    private int GetUserId()
    {
        var nameClaim = User.Claims.FirstOrDefault(c => 
            c.Type.Contains("nameidentifier") || 
            c.Type.EndsWith("nameidentifier"));
        
        return nameClaim != null ? int.Parse(nameClaim.Value) : 0;
    }

    private async Task<int?> GetBarberoId()
    {
        var usuarioId = GetUserId();
        var barbero = await context.Barberos
            .FirstOrDefaultAsync(b => b.UsuarioId == usuarioId);
        return barbero?.Id;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetTurnos([FromQuery] DateTime? fecha = null)
    {
        var query = context.Turnos.AsQueryable();
        if (fecha.HasValue)
        {
            var inicio = DateTime.SpecifyKind(fecha.Value.Date, DateTimeKind.Utc);
            var fin = inicio.AddDays(1);
            query = query.Where(t => t.FechaHora >= inicio && t.FechaHora < fin);
        }
        else
        {
            query = query.Where(t => t.FechaHora >= DateTime.UtcNow);
        }

        var turnos = await query.Select(t => new
        {
            Id = t.Id,
            FechaHora = t.FechaHora,
            Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
            Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
            Estado = t.Estado,
            EstadoPago = t.EstadoPago,
            Servicios = t.TurnoServicios.Select(ts => ts.Servicio.Nombre).ToList(),
            PrecioTotal = t.PrecioTotal
        }).ToListAsync();
        return Ok(turnos);
    }

    [HttpGet("barbero/{barberoId}")]
    [Authorize(Roles = "admin,barbero")]
    public async Task<IActionResult> GetTurnosByBarbero(int barberoId, [FromQuery] DateTime? fecha = null)
    {
        var query = context.Turnos.Where(t => t.BarberoId == barberoId);
        if (fecha.HasValue)
        {
            var inicio = DateTime.SpecifyKind(fecha.Value.Date, DateTimeKind.Utc);
            var fin = inicio.AddDays(1);
            query = query.Where(t => t.FechaHora >= inicio && t.FechaHora < fin);
        }
        else
        {
            query = query.Where(t => t.FechaHora >= DateTime.UtcNow);
        }

        var turnos = await query.Select(t => new
        {
            Id = t.Id,
            FechaHora = t.FechaHora,
            Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
            Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
            Estado = t.Estado,
            EstadoPago = t.EstadoPago,
            Servicios = t.TurnoServicios.Select(ts => ts.Servicio.Nombre).ToList(),
            PrecioTotal = t.PrecioTotal
        }).ToListAsync();
        return Ok(turnos);
    }

    [HttpGet("mis-turnos-barbero")]
    [Authorize(Roles = "barbero")]
    public async Task<IActionResult> GetMisTurnosComoBarbero([FromQuery] DateTime? fecha = null)
    {
        var usuarioId = GetUserId();
        var barbero = await context.Barberos.FirstOrDefaultAsync(b => b.UsuarioId == usuarioId);
        if (barbero == null)
            return NotFound(new { message = "No eres un barbero registrado" });

        var query = context.Turnos.Where(t => t.BarberoId == barbero.Id);
        if (fecha.HasValue)
        {
            var inicio = DateTime.SpecifyKind(fecha.Value.Date, DateTimeKind.Utc);
            var fin = inicio.AddDays(1);
            query = query.Where(t => t.FechaHora >= inicio && t.FechaHora < fin);
        }
        else
        {
            query = query.Where(t => t.FechaHora >= DateTime.UtcNow);
        }

        var turnos = await query.Select(t => new
        {
            Id = t.Id,
            FechaHora = t.FechaHora,
            Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
            Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
            Estado = t.Estado,
            EstadoPago = t.EstadoPago,
            Servicios = t.TurnoServicios.Select(ts => ts.Servicio.Nombre).ToList(),
            PrecioTotal = t.PrecioTotal
        }).ToListAsync();
        return Ok(turnos);
    }

    [HttpGet("cliente/{clienteId}")]
    [Authorize(Roles = "admin,cliente")]
    public async Task<IActionResult> GetTurnosByCliente(int clienteId, [FromQuery] DateTime? fecha = null)
    {
        var nameClaim = User.Claims.FirstOrDefault(c =>
            c.Type.Contains("nameidentifier") || c.Type.EndsWith("nameidentifier"));
        if (nameClaim == null)
            return BadRequest(new { message = "No se pudo identificar el usuario" });

        var usuarioId = int.Parse(nameClaim.Value);
        var esAdmin = User.IsInRole("admin");
        if (!esAdmin && clienteId != usuarioId)
            return Forbid();

        var query = context.Turnos.Where(t => t.UsuarioId == clienteId);
        if (fecha.HasValue)
        {
            var inicio = DateTime.SpecifyKind(fecha.Value.Date, DateTimeKind.Utc);
            var fin = inicio.AddDays(1);
            query = query.Where(t => t.FechaHora >= inicio && t.FechaHora < fin);
        }
        else
        {
            query = query.Where(t => t.FechaHora >= DateTime.UtcNow);
        }

        var turnos = await query.Select(t => new
        {
            Id = t.Id,
            FechaHora = t.FechaHora,
            Barbero = t.Barbero.Nombre + " " + t.Barbero.Apellido,
            Cliente = t.Usuario.Nombre + " " + t.Usuario.Apellido,
            Estado = t.Estado,
            EstadoPago = t.EstadoPago,
            Servicios = t.TurnoServicios.Select(ts => ts.Servicio.Nombre).ToList(),
            PrecioTotal = t.PrecioTotal
        }).ToListAsync();
        return Ok(turnos);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateTurno([FromBody] CrearTurnoDTO dto)
    {
        var usuarioId = GetUserId();

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
            ServicioId = dto.ServicioBaseId,
            PrecioTotal = precioTotal
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
    [Authorize(Roles = "admin,cliente,barbero")]
    public async Task<IActionResult> DeleteTurno(int id)
    {
        var turno = await context.Turnos.FindAsync(id);
        if (turno == null) return NotFound();
        
        var esAdmin = User.IsInRole("admin");
        
        // Admin puede cancelar cualquier turno
        if (!esAdmin)
        {
            // Barbero puede cancelar turnos asignados a él
            if (User.IsInRole("barbero"))
            {
                var barbero = await context.Barberos
                    .FirstOrDefaultAsync(b => b.UsuarioId == GetUserId());
                if (barbero == null || turno.BarberoId != barbero.Id)
                {
                    return Forbid();
                }
            }
            // Cliente solo sus propios turnos
            else if (User.IsInRole("cliente"))
            {
                if (turno.UsuarioId != GetUserId())
                {
                    return Forbid();
                }
            }
        }

        turno.Estado = "cancelado";
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/estado")]
    [Authorize(Roles = "admin,barbero")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDTO dto)
    {
        var estadosValidos = new[] { "pendiente", "confirmado", "pagado", "cancelado" };
        if (!estadosValidos.Contains(dto.Estado))
            return BadRequest("Estado no válido.");

        var turno = await context.Turnos.FindAsync(id);
        if (turno == null) return NotFound();

        if (turno.Estado == "cancelado")
            return BadRequest("No se puede cambiar el estado de un turno cancelado.");

        if (User.IsInRole("barbero"))
        {
            var barbero = await context.Barberos
                .FirstOrDefaultAsync(b => b.UsuarioId == GetUserId());
            if (barbero == null || turno.BarberoId != barbero.Id)
                return Forbid();
        }

        turno.Estado = dto.Estado;
        await context.SaveChangesAsync();
        return Ok(new { turno.Id, turno.Estado });
    }

    [HttpPatch("{id}/confirmar")]
  [Authorize(Roles = "admin,barbero")]
  public async Task<IActionResult> ConfirmarTurno(int id)
  {
      var turno = await context.Turnos.FindAsync(id);
      if (turno == null) return NotFound();

      if (turno.Estado == "cancelado")
          return BadRequest("No se puede confirmar un turno cancelado.");

      if (User.IsInRole("barbero"))
      {
          var barbero = await context.Barberos
              .FirstOrDefaultAsync(b => b.UsuarioId == GetUserId());
          if (barbero == null || turno.BarberoId != barbero.Id) return Forbid();
      }

      turno.Estado = "confirmado";
      await context.SaveChangesAsync();
      return Ok(new { turno.Id, turno.Estado });
  }

  [HttpPatch("{id}/pago")]
  [Authorize(Roles = "admin,barbero")]
  public async Task<IActionResult> MarcarPagado(int id)
  {
      var turno = await context.Turnos.FindAsync(id);
      if (turno == null) return NotFound();

      if (turno.Estado == "cancelado")
          return BadRequest("No se puede marcar como pagado un turno cancelado.");

      if (User.IsInRole("barbero"))
      {
          var barbero = await context.Barberos
              .FirstOrDefaultAsync(b => b.UsuarioId == GetUserId());
          if (barbero == null || turno.BarberoId != barbero.Id) return Forbid();
      }

      turno.EstadoPago = "pagado";
      await context.SaveChangesAsync();
      return Ok(new { turno.Id, turno.EstadoPago });
  }
}