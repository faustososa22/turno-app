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

    public ServiciosController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllActives()
    {
        var servicios = await context.Servicios
        .Where(s => s.Activo)
        .ToListAsync();
        return Ok(servicios);
    }

    [HttpGet("disabled")]
    public async Task<IActionResult> GetAllDisabled()
    {
        var servicios = await context.Servicios
        .Where(s => !s.Activo)
        .ToListAsync();
        return Ok(servicios);
    }

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

    [HttpPost]
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

    [HttpPut("{id}")]
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

    [HttpPatch("{id}/reactivar")]
    public async Task<IActionResult> Reactivar(int id)
    {
        var servicioExiste = await context.Servicios.FindAsync(id);
        if (servicioExiste == null) return NotFound();
        if (servicioExiste.Activo) return BadRequest("El servicio ya está activo.");
        servicioExiste.Activo = true;
        await context.SaveChangesAsync();
        return Ok(servicioExiste);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Patch(int id, [FromBody] ServicioDTO servicioDto)
    {
        var servicioExiste = await context.Servicios.FindAsync(id);
        if (servicioExiste == null || !servicioExiste.Activo)
        {
            return NotFound();
        }

        if (!String.IsNullOrEmpty(servicioDto.Nombre))
        {
            servicioExiste.Nombre = servicioDto.Nombre;
        }
        if (servicioDto.DuracionMinutos > 0)
        {
            servicioExiste.DuracionMinutos = servicioDto.DuracionMinutos;
        }
        if (!String.IsNullOrEmpty(servicioDto.Descripcion))
        {
            servicioExiste.Descripcion = servicioDto.Descripcion;
        }
        if (servicioDto.Precio > 0)
        {
            servicioExiste.Precio = servicioDto.Precio;
        }
        
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
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