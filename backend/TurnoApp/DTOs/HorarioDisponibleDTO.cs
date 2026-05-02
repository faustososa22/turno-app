using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TurnoApp.DTOs;

public class HorarioDisponibleDTO
{
    [Required(ErrorMessage = "El día de la semana es obligatorio.")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public DayOfWeek DiaSemana { get; set; }
    [Required(ErrorMessage = "La hora de inicio es obligatoria.")]
    public TimeOnly HoraInicio { get; set; }
    [Required(ErrorMessage = "La hora de fin es obligatoria.")]
    public TimeOnly HoraFin { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "Debe ingresar un barbero válido.")]
    public int BarberoId { get; set; }
}