using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;

public class UsuarioDTO
{
    [Required]
    public string Nombre { get; set; } = null!;
    [Required]
    public string Apellido { get; set; } = null!;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
    [Required]
    public string Rol { get; set; } = null!;
}