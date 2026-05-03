using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TurnoApp.Data;
using TurnoApp.DTOs;
using TurnoApp.Models;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        this.context = context;
        _configuration = configuration;
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Register([FromBody] RegistroUsuarioDTO dto)
    {
        var usuarioExiste = await context.Usuarios.AnyAsync(u => u.Email == dto.Email);

        if (usuarioExiste){
            return BadRequest(new { message = "El email ya está registrado" });
        }

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        var token = GenerarToken(usuario);
        context.Usuarios.Add(usuario);
        await context.SaveChangesAsync();
        return Ok(new { token });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUsuarioDTO dto)
    {
        var usuarioExiste = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (usuarioExiste == null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuarioExiste.PasswordHash))
        {
            return Unauthorized(new { message = "Credenciales inválidas" });
        }

        var token = GenerarToken(usuarioExiste);
        return Ok(new { token });
    }

    private string GenerarToken(Usuario usuario)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
        new Claim(ClaimTypes.Email, usuario.Email),
        new Claim(ClaimTypes.Role, usuario.Rol)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var expiration = DateTime.UtcNow.AddHours(double.Parse(_configuration["Jwt:ExpirationHours"]!));

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: expiration,
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
}