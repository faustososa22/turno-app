namespace TurnoApp.Models;

public class TurnoServicio
{
    public int TurnoId { get; set; }
    public Turno Turno { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;
}