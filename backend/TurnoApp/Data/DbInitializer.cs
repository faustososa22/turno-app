using Microsoft.EntityFrameworkCore;
using TurnoApp.Models;

namespace TurnoApp.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Si ya hay usuarios, el seed ya corrió — no hacemos nada
        if (await db.Usuarios.AnyAsync()) return;

        // ── Usuarios ──────────────────────────────────────────────────────────

        var admin = new Usuario
        {
            Nombre = "Admin",
            Apellido = "BarberShop",
            Email = "admin@barbershop.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Rol = "admin"
        };

        var usuCarlos = new Usuario
        {
            Nombre = "Carlos",
            Apellido = "García",
            Email = "carlos@barbershop.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("barbero123"),
            Rol = "barbero"
        };

        var usuMartin = new Usuario
        {
            Nombre = "Martín",
            Apellido = "López",
            Email = "martin@barbershop.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("barbero123"),
            Rol = "barbero"
        };

        var usuCliente = new Usuario
        {
            Nombre = "Juan",
            Apellido = "Pérez",
            Email = "juan@mail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("cliente123"),
            Rol = "cliente"
        };

        db.Usuarios.AddRange(admin, usuCarlos, usuMartin, usuCliente);
        await db.SaveChangesAsync();

        // ── Barberos ──────────────────────────────────────────────────────────

        var carlos = new Barbero
        {
            Nombre = "Carlos",
            Apellido = "García",
            Telefono = "11-1234-5678",
            UsuarioId = usuCarlos.Id
        };

        var martin = new Barbero
        {
            Nombre = "Martín",
            Apellido = "López",
            Telefono = "11-8765-4321",
            UsuarioId = usuMartin.Id
        };

        db.Barberos.AddRange(carlos, martin);
        await db.SaveChangesAsync();

        // ── Servicios ─────────────────────────────────────────────────────────

        var corte = new Servicio
        {
            Nombre = "Corte de pelo",
            Descripcion = "Corte clásico con tijera o máquina",
            DuracionMinutos = 30,
            Precio = 3500,
            Tipo = "base"
        };

        var barba = new Servicio
        {
            Nombre = "Arreglo de barba",
            Descripcion = "Perfilado y arreglo de barba",
            DuracionMinutos = 20,
            Precio = 2500,
            Tipo = "base"
        };

        var corteBarba = new Servicio
        {
            Nombre = "Corte + Barba",
            Descripcion = "Corte de pelo y arreglo de barba completo",
            DuracionMinutos = 50,
            Precio = 5500,
            Tipo = "base"
        };

        var cejas = new Servicio
        {
            Nombre = "Depilación de cejas",
            Descripcion = "Depilación y perfilado de cejas con hilo",
            DuracionMinutos = 10,
            Precio = 1000,
            Tipo = "addon"
        };

        var tratamiento = new Servicio
        {
            Nombre = "Tratamiento capilar",
            Descripcion = "Hidratación y nutrición del cabello",
            DuracionMinutos = 20,
            Precio = 1500,
            Tipo = "addon"
        };

        db.Servicios.AddRange(corte, barba, corteBarba, cejas, tratamiento);
        await db.SaveChangesAsync();

        // ── BarberoServicio (qué servicios ofrece cada barbero) ───────────────

        db.BarberoServicios.AddRange(
            new BarberoServicio { BarberoId = carlos.Id, ServicioId = corte.Id },
            new BarberoServicio { BarberoId = carlos.Id, ServicioId = barba.Id },
            new BarberoServicio { BarberoId = carlos.Id, ServicioId = corteBarba.Id },
            new BarberoServicio { BarberoId = carlos.Id, ServicioId = cejas.Id },
            new BarberoServicio { BarberoId = carlos.Id, ServicioId = tratamiento.Id },
            new BarberoServicio { BarberoId = martin.Id, ServicioId = corte.Id },
            new BarberoServicio { BarberoId = martin.Id, ServicioId = barba.Id },
            new BarberoServicio { BarberoId = martin.Id, ServicioId = corteBarba.Id },
            new BarberoServicio { BarberoId = martin.Id, ServicioId = cejas.Id }
        );
        await db.SaveChangesAsync();

        // ── Horarios (lunes a sábado, 9:00 - 18:00) ──────────────────────────

        var dias = new[]
        {
            DayOfWeek.Monday,
            DayOfWeek.Tuesday,
            DayOfWeek.Wednesday,
            DayOfWeek.Thursday,
            DayOfWeek.Friday,
            DayOfWeek.Saturday,
        };

        foreach (var dia in dias)
        {
            db.HorariosDisponibles.AddRange(
                new HorarioDisponible
                {
                    BarberoId = carlos.Id,
                    DiaSemana = dia,
                    HoraInicio = new TimeOnly(9, 0),
                    HoraFin = new TimeOnly(18, 0)
                },
                new HorarioDisponible
                {
                    BarberoId = martin.Id,
                    DiaSemana = dia,
                    HoraInicio = new TimeOnly(10, 0),
                    HoraFin = new TimeOnly(19, 0)
                }
            );
        }
        await db.SaveChangesAsync();

        // ── Turnos de ejemplo ─────────────────────────────────────────────────

        // Turno pasado - confirmado y pagado
        var turno1 = new Turno
        {
            UsuarioId = usuCliente.Id,
            BarberoId = carlos.Id,
            ServicioId = corte.Id,
            FechaHora = DateTime.UtcNow.AddDays(-3).Date.AddHours(10),
            FechaHoraFin = DateTime.UtcNow.AddDays(-3).Date.AddHours(10).AddMinutes(30),
            Estado = "confirmado",
            EstadoPago = "pagado",
            PrecioTotal = 3500
        };

        // Turno pasado - cancelado
        var turno2 = new Turno
        {
            UsuarioId = usuCliente.Id,
            BarberoId = martin.Id,
            ServicioId = barba.Id,
            FechaHora = DateTime.UtcNow.AddDays(-1).Date.AddHours(14),
            FechaHoraFin = DateTime.UtcNow.AddDays(-1).Date.AddHours(14).AddMinutes(20),
            Estado = "cancelado",
            EstadoPago = "pendiente",
            PrecioTotal = 2500
        };

        // Turno futuro - pendiente
        var turno3 = new Turno
        {
            UsuarioId = usuCliente.Id,
            BarberoId = carlos.Id,
            ServicioId = corteBarba.Id,
            FechaHora = DateTime.UtcNow.AddDays(2).Date.AddHours(11),
            FechaHoraFin = DateTime.UtcNow.AddDays(2).Date.AddHours(11).AddMinutes(50),
            Estado = "pendiente",
            EstadoPago = "pendiente",
            PrecioTotal = 5500
        };

        // Turno futuro - confirmado
        var turno4 = new Turno
        {
            UsuarioId = usuCliente.Id,
            BarberoId = martin.Id,
            ServicioId = corte.Id,
            FechaHora = DateTime.UtcNow.AddDays(4).Date.AddHours(15),
            FechaHoraFin = DateTime.UtcNow.AddDays(4).Date.AddHours(15).AddMinutes(30),
            Estado = "confirmado",
            EstadoPago = "pendiente",
            PrecioTotal = 3500
        };

        db.Turnos.AddRange(turno1, turno2, turno3, turno4);
        await db.SaveChangesAsync();

        // TurnoServicios (relación muchos a muchos)
        db.TurnoServicios.AddRange(
            new TurnoServicio { TurnoId = turno1.Id, ServicioId = corte.Id },
            new TurnoServicio { TurnoId = turno2.Id, ServicioId = barba.Id },
            new TurnoServicio { TurnoId = turno3.Id, ServicioId = corteBarba.Id },
            new TurnoServicio { TurnoId = turno4.Id, ServicioId = corte.Id }
        );
        await db.SaveChangesAsync();
    }
}
