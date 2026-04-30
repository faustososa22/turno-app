using Microsoft.EntityFrameworkCore;
using TurnoApp.Domain.Entities;

namespace TurnoApp.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Servicio> Servicios { get; set; } = null!;
    public DbSet<Turno> Turnos { get; set; } = null!;
    public DbSet<HorarioDisponible> HorariosDisponibles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de relaciones y restricciones
        modelBuilder.Entity<Turno>()
            .HasOne(t => t.Usuario)
            .WithMany()
            .HasForeignKey(t => t.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Turno>()
            .HasOne(t => t.Servicio)
            .WithMany()
            .HasForeignKey(t => t.ServicioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}