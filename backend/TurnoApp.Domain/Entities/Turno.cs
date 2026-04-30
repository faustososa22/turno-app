namespace TurnoApp.Domain.Entities;

public class Turno
{
    public int Id { get; set; }
    public DateTime FechaHora { get; set; }
    public string Estado { get; set; } = "pendiente"; // pendiente, confirmado, cancelado
    public string? Notas { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Relaciones
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public int ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;
}