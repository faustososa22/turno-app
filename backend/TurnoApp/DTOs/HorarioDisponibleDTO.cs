namespace TurnoApp.DTOs;

public class HorarioDisponibleDTO
{
    public DayOfWeek DiaSemana { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public int BarberoId { get; set; }
}