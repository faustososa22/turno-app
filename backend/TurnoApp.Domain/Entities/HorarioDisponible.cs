namespace TurnoApp.Domain.Entities;

public class HorarioDisponible
{
    public int Id { get; set; }
    public DayOfWeek DiaSemana { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public bool Activo { get; set; } = true;

    public int BarberoId { get; set; }
    public Barbero Barbero { get; set; } = null!;
}