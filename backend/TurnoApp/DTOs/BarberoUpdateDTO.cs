using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;

public class BarberoUpdateDTO
{
    [Required]
    public string Nombre { get; set; } = string.Empty;
    [Required]
    public string Apellido { get; set; } = string.Empty;
    [Required]
    public string Telefono { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
}
