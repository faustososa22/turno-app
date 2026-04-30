namespace TurnoApp.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Rol { get; set; } = "cliente"; // "cliente" o "admin"
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
}