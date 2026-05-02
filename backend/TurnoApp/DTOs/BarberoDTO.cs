using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;

public class BarberoDTO
{
    [Required]
    public string Nombre { get; set; } = string.Empty;
    [Required]
    public string Apellido { get; set; } = string.Empty;
    [Required]
    public string Telefono { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

}