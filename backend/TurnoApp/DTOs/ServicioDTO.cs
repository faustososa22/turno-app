using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;
public class ServicioDTO
{
    [Required]
    public string Nombre { get; set; } = string.Empty;
    [Required]
    public string Descripcion { get; set; } = string.Empty;
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "La duración debe ser mayor a 0 minutos.")]
    public int DuracionMinutos { get; set; }
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0.")]
    public decimal Precio { get; set; }
    public string? Tipo { get; set; }
}