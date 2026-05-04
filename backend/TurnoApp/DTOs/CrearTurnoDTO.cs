namespace TurnoApp.DTOs;

public class CrearTurnoDTO
{
    public int BarberoId { get; set; }
    public int ServicioBaseId { get; set; }
    public List<int> AddonIds { get; set; } = new();
    public string FechaHora { get; set; } = string.Empty; // Formato: 2026-05-04T10:00:00
}

public class HuecoDisponibleDTO
{
    public string Hora { get; set; } = string.Empty;
    public bool Disponible { get; set; }
}