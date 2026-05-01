using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoApp.Data;
using TurnoApp.DTOs;
using TurnoApp.Models;

namespace TurnoApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BarberosController : ControllerBase
{
    private readonly AppDbContext context;

    public BarberosController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBarberos()
    {
        var barberos = await context.Barberos
        .Include(b => b.Usuario)
        .Where(b => b.Activo)
        .Select(b => new
        {
            b.Id,
            b.Nombre,
            b.Apellido,
            b.Telefono,
            b.FotoUrl,
            Email = b.Usuario.Email,
            Activo = b.Activo
        })
        .ToListAsync();
        return Ok(barberos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBarbero(int id)
    {
        var barbero = await context.Barberos
        .Include(b => b.Usuario)
        .Where(b => b.Id == id && b.Activo)
        .Select(b => new
        {
            b.Id,
            b.Nombre,
            b.Apellido,
            b.Telefono,
            b.FotoUrl,
            Email = b.Usuario.Email,
            Activo = b.Activo
        })
        .FirstOrDefaultAsync();
        if (barbero == null)
        {
            return NotFound();
        }
        return Ok(barbero);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBarbero(BarberoDTO dto)
    {
        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Rol = "barbero"
        };
        context.Usuarios.Add(usuario);

        var barbero = new Barbero
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Telefono = dto.Telefono,
            FotoUrl = dto.FotoUrl,
            Usuario = usuario
        };
        context.Barberos.Add(barbero);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBarbero), new { id = barbero.Id }, barbero);   
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBarbero(int id, BarberoDTO dto)
    {
        var barbero = await context.Barberos.FindAsync(id);
        if (barbero == null) return NotFound();

        barbero.Nombre = dto.Nombre;
        barbero.Apellido = dto.Apellido;
        barbero.Telefono = dto.Telefono;
        barbero.FotoUrl = dto.FotoUrl;

        await context.SaveChangesAsync();
        return Ok(barbero);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchBarbero(int id, [FromBody] BarberoDTO dto)
    {
        var barbero = await context.Barberos.FindAsync(id);
        if (barbero == null) return NotFound();

        if (!string.IsNullOrEmpty(dto.Nombre))
            barbero.Nombre = dto.Nombre;

        if (!string.IsNullOrEmpty(dto.Apellido))
            barbero.Apellido = dto.Apellido;

        if (!string.IsNullOrEmpty(dto.Telefono))
            barbero.Telefono = dto.Telefono;

        if (!string.IsNullOrEmpty(dto.FotoUrl))
            barbero.FotoUrl = dto.FotoUrl;

        await context.SaveChangesAsync();
        return Ok(barbero);
    }

    [HttpPatch("{id}/reactivar")]
    public async Task<IActionResult> ReactivarBarbero(int id)
    {
        var barbero = await context.Barberos.FindAsync(id);
        if (barbero == null) return NotFound();
        if (barbero.Activo) return BadRequest("El barbero ya está activo.");

        barbero.Activo = true;
        await context.SaveChangesAsync();
        return Ok(barbero);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBarbero(int id)
    {
        var barbero = await context.Barberos.FindAsync(id);
        if (barbero == null)
        {
            return NotFound();
        }

        barbero.Activo = false;
        await context.SaveChangesAsync();
        return NoContent();
    }

    //SERVICIOS DE UN BARBERO
    //Agregar servicio a un barbero
    [HttpPost("{id}/servicios/{idServicio}")]
    public async Task<IActionResult> AddServicio(int id, int idServicio)
    {
        var barbero = await context.Barberos.FindAsync(id);
        if (barbero == null) return NotFound();

        var servicio = await context.Servicios.FindAsync(idServicio);
        if (servicio == null) return NotFound();

        var existeRelacion = await context.BarberoServicios.AnyAsync(bs => bs.BarberoId == id && bs.ServicioId == idServicio);
        if (existeRelacion) return BadRequest("El barbero ya tiene asignado ese servicio");

        var barberoServicio = new BarberoServicio
        {
            BarberoId = id,
            ServicioId = idServicio
        };
        context.BarberoServicios.Add(barberoServicio);
        await context.SaveChangesAsync();
        return Ok(barberoServicio);
    }

    //Eliminar servicio de un barbero
    [HttpDelete("{id}/servicios/{idServicio}")]
    public async Task<IActionResult> RemoveServicio(int id, int idServicio)
    {
        var barbero = await context.Barberos.FindAsync(id);
        if (barbero == null) return NotFound();

        var servicio = await context.Servicios.FindAsync(idServicio);
        if (servicio == null) return NotFound();

        var barberoServicio = await context.BarberoServicios.FirstOrDefaultAsync(bs => bs.BarberoId == id && bs.ServicioId == idServicio);
        if (barberoServicio == null) return NotFound("El barbero no tiene asignado ese servicio");

        context.BarberoServicios.Remove(barberoServicio);
        await context.SaveChangesAsync();
        return NoContent();
    }


}