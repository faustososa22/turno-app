namespace TurnoApp.Models;

public class Turno
{
    public int Id { get; set; }
    public DateTime FechaHora { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public string Estado { get; set; } = "pendiente"; // pendiente, confirmado, cancelado
    public string? Notas { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public int BarberoId { get; set; }
    public Barbero Barbero { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public ICollection<TurnoServicio> TurnoServicios { get; set; } = new List<TurnoServicio>();
}