namespace TurnoApp.Models;

public class BarberoServicio
{
    
    public int BarberoId { get; set; }
    public Barbero Barbero { get; set; } = null!;
    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;
}