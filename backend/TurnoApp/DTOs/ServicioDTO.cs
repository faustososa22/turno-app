namespace TurnoApp.DTOs;
public class ServicioDTO
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int DuracionMinutos { get; set; }
    public decimal Precio { get; set; }
}