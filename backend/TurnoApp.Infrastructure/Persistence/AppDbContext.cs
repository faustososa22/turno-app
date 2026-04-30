using Microsoft.EntityFrameworkCore;
using TurnoApp.Domain.Entities;

namespace TurnoApp.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Barbero> Barberos { get; set; } = null!;
    public DbSet<Servicio> Servicios { get; set; } = null!;
    public DbSet<Turno> Turnos { get; set; } = null!;
    public DbSet<HorarioDisponible> HorariosDisponibles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Usuario — email único
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Barbero — relación uno a uno con Usuario
        modelBuilder.Entity<Barbero>(entity =>
        {
            entity.HasOne(b => b.Usuario)
                  .WithOne()
                  .HasForeignKey<Barbero>(b => b.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // HorarioDisponible — pertenece a un Barbero
        modelBuilder.Entity<HorarioDisponible>(entity =>
        {
            entity.HasOne(h => h.Barbero)
                  .WithMany(b => b.Horarios)
                  .HasForeignKey(h => h.BarberoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Turno — relaciones con Usuario, Barbero y Servicio
        modelBuilder.Entity<Turno>(entity =>
        {
            entity.HasOne(t => t.Usuario)
                  .WithMany()
                  .HasForeignKey(t => t.UsuarioId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Barbero)
                  .WithMany(b => b.Turnos)
                  .HasForeignKey(t => t.BarberoId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Servicio)
                  .WithMany()
                  .HasForeignKey(t => t.ServicioId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}