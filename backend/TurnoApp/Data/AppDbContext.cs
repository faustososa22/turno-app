using Microsoft.EntityFrameworkCore;
using TurnoApp.Models;

namespace TurnoApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Barbero> Barberos { get; set; } = null!;
    public DbSet<Servicio> Servicios { get; set; } = null!;
    public DbSet<Turno> Turnos { get; set; } = null!;
    public DbSet<HorarioDisponible> HorariosDisponibles { get; set; } = null!;
    public DbSet<BarberoServicio> BarberoServicios { get; set; } = null!;
    public DbSet<TurnoServicio> TurnoServicios { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Barbero>(entity =>
        {
            entity.HasOne(b => b.Usuario)
                  .WithOne()
                  .HasForeignKey<Barbero>(b => b.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HorarioDisponible>(entity =>
        {
            entity.HasOne(h => h.Barbero)
                  .WithMany(b => b.Horarios)
                  .HasForeignKey(h => h.BarberoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

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


        modelBuilder.Entity<BarberoServicio>(entity =>
        {
            entity.HasKey(bs => new { bs.BarberoId, bs.ServicioId });

            entity.HasOne(bs => bs.Barbero)
                  .WithMany(b => b.BarberoServicios)
                  .HasForeignKey(bs => bs.BarberoId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(bs => bs.Servicio)
                  .WithMany(s => s.BarberoServicios)
                  .HasForeignKey(bs => bs.ServicioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TurnoServicio>(entity =>
        {
            entity.HasKey(ts => new { ts.TurnoId, ts.ServicioId });

            entity.HasOne(ts => ts.Turno)
                  .WithMany(t => t.TurnoServicios)
                  .HasForeignKey(ts => ts.TurnoId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ts => ts.Servicio)
                  .WithMany()
                  .HasForeignKey(ts => ts.ServicioId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}