using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;

public class RegistroUsuarioDTO
{
    [Required]
    public string Nombre { get; set; } = null!;
    [Required]
    public string Apellido { get; set; } = null!;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = null!;
}