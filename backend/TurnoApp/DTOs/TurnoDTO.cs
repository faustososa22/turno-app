using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;

public class TurnoDTO
{
    [Required]
    [DataType(DataType.DateTime)]
    public DateTime FechaHora { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "Debe ingresar un barbero válido.")]
    public int BarberoId { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "Debe ingresar un servicio válido.")]
    public int ServicioId { get; set; }
}