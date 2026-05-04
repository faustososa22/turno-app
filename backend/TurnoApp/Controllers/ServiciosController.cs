using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoApp.Data;
using TurnoApp.DTOs;
using TurnoApp.Models;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiciosController : ControllerBase
{
    private readonly AppDbContext context;

    // Inyección de dependencias del contexto de la base de datos
    public ServiciosController(AppDbContext context)
    {
        this.context = context;
    }

    // GET: api/servicios
    [HttpGet]
    public async Task<IActionResult> GetAllActives()
    {
        var servicios = await context.Servicios
        .Where(s => s.Activo)
        .ToListAsync();
        return Ok(servicios);
    }

    [HttpGet("barbero/{barberoId}")]
    public async Task<IActionResult> GetServiciosByBarbero(int barberoId)
    {
        var servicios = await context.BarberoServicios
            .Where(bs => bs.BarberoId == barberoId)
            .Include(bs => bs.Servicio)
            .Select(bs => bs.Servicio)
            .Where(s => s.Activo)
            .ToListAsync();

        return Ok(servicios);
    }

    // GET: api/servicios/disabled
    [HttpGet("disabled")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllDisabled()
    {
        var servicios = await context.Servicios
        .Where(s => !s.Activo)
        .ToListAsync();
        return Ok(servicios);
    }

    // GET: api/servicios/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var servicio = await context.Servicios.FindAsync(id);
        if (servicio == null || !servicio.Activo)
        {
            return NotFound();
        }
        return Ok(servicio);
    }

    // POST: api/servicios
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Post([FromBody] ServicioDTO servicioDto)
    {
        var nuevoServicio = new Servicio
        {
            Nombre = servicioDto.Nombre,
            DuracionMinutos = servicioDto.DuracionMinutos,
            Descripcion = servicioDto.Descripcion,
            Precio = servicioDto.Precio,
            Activo = true
        };

        context.Servicios.Add(nuevoServicio);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = nuevoServicio.Id }, nuevoServicio);
    }

    // PUT: api/servicios/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Put(int id, [FromBody] ServicioDTO servicioDto)
    {
        var servicioExiste = await context.Servicios.FindAsync(id);
        if (servicioExiste == null || !servicioExiste.Activo)
        {
            return NotFound();
        }

        servicioExiste.Nombre = servicioDto.Nombre;
        servicioExiste.DuracionMinutos = servicioDto.DuracionMinutos;
        servicioExiste.Descripcion = servicioDto.Descripcion;
        servicioExiste.Precio = servicioDto.Precio;
        await context.SaveChangesAsync();
        return NoContent();
    }

    // PATCH: api/servicios/{id}/reactivar
    [HttpPatch("{id}/reactivar")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Reactivar(int id)
    {
        var servicioExiste = await context.Servicios.FindAsync(id);
        if (servicioExiste == null) return NotFound();
        if (servicioExiste.Activo) return BadRequest("El servicio ya está activo.");
        servicioExiste.Activo = true;
        await context.SaveChangesAsync();
        return Ok(servicioExiste);
    }

    // PATCH: api/servicios/{id}
    [HttpPatch("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Patch(int id, [FromBody] ServicioPatchDTO servicioDto)
    {
        var servicioExiste = await context.Servicios.FindAsync(id);
        if (servicioExiste == null || !servicioExiste.Activo) return NotFound();

        if (!string.IsNullOrEmpty(servicioDto.Nombre))
        servicioExiste.Nombre = servicioDto.Nombre;

        if (!string.IsNullOrEmpty(servicioDto.Descripcion))
        servicioExiste.Descripcion = servicioDto.Descripcion;

        if (servicioDto.DuracionMinutos > 0)
        servicioExiste.DuracionMinutos = servicioDto.DuracionMinutos.Value;

        if (servicioDto.Precio > 0)
        servicioExiste.Precio = servicioDto.Precio.Value;

        if (!string.IsNullOrEmpty(servicioDto.Tipo))
        servicioExiste.Tipo = servicioDto.Tipo;

        await context.SaveChangesAsync();
        return Ok(servicioExiste);
    }

    // DELETE: api/servicios/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var servicioExiste = await context.Servicios.FindAsync(id);
        if (servicioExiste == null || !servicioExiste.Activo)
        {
            return NotFound();
        }
        servicioExiste.Activo = false;
        await context.SaveChangesAsync();
        return NoContent();
    }
}