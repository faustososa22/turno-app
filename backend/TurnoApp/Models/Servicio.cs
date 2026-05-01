namespace TurnoApp.Models;

public class Servicio
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int DuracionMinutos { get; set; }
    public decimal Precio { get; set; }
    public bool Activo { get; set; } = true;

    public ICollection<BarberoServicio> BarberoServicios { get; set; } = new List<BarberoServicio>();   
}