using Microsoft.AspNetCore.Mvc;
using TurnoApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using TurnoApp.DTOs;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext context;

    public UsuariosController(AppDbContext context)
    {
        this.context = context;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetUsuarios()
    {
        var usuarios = await context.Usuarios
        .Select(u => new
        {
            u.Id,
            u.Nombre,
            u.Apellido,
            u.Email,
            u.Rol,
            u.Activo
        })
        .ToListAsync();
        return Ok(usuarios);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin,cliente")]
    public async Task<IActionResult> GetUsuario(int id)
    {
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var esAdmin = User.IsInRole("admin");
        if (!esAdmin && usuarioId != id) return Forbid();

        var usuario = await context.Usuarios
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Nombre,
                u.Apellido,
                u.Email,
                u.Rol,
                u.Activo
            })
            .FirstOrDefaultAsync();
        if (usuario == null) return NotFound();
        return Ok(usuario);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,cliente")]
    public async Task<IActionResult> UpdateUsuario(int id, UsuarioDTO dto)
    {
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var esAdmin = User.IsInRole("admin");
        if (!esAdmin && usuarioId != id) return Forbid();

        var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
        if (usuario == null) return NotFound();

        usuario.Nombre = dto.Nombre;
        usuario.Apellido = dto.Apellido;
        usuario.Email = dto.Email;
        if (esAdmin) usuario.Rol = dto.Rol;

        await context.SaveChangesAsync();
        return NoContent();
    } 

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,cliente")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuarioId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var esAdmin = User.IsInRole("admin");
        if (!esAdmin && usuarioId != id) return Forbid();

        var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
        if (usuario == null) return NotFound();

        usuario.Activo = false;
        await context.SaveChangesAsync();
        return NoContent();
    }
}