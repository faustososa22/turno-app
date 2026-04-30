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
    public async Task<IActionResult> GetAll()
    {
        var servicios = await context.Servicios
        .Where(s => s.Activo)
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
}