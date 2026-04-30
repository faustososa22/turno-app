namespace TurnoApp.Domain.Entities;

public class Barbero
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public bool Activo { get; set; } = true;

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public ICollection<HorarioDisponible> Horarios { get; set; } = new List<HorarioDisponible>();
    public ICollection<Turno> Turnos { get; set; } = new List<Turno>();
}