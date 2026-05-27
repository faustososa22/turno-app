using Microsoft.EntityFrameworkCore;
using TurnoApp.Data;
using TurnoApp.Models;

namespace TurnoApp.Services;

public class TurnoService : ITurnoService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public TurnoService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<List<BarberoInfoDto>> GetBarberosAsync()
    {
        return await _context.Barberos
            .Where(b => b.Activo)
            .Select(b => new BarberoInfoDto(b.Id, b.Nombre + " " + b.Apellido))
            .ToListAsync();
    }

    public async Task<List<ServicioInfoDto>> GetServiciosAsync(int barberoId)
    {
        return await _context.BarberoServicios
            .Where(bs => bs.BarberoId == barberoId && bs.Servicio.Activo)
            .Select(bs => new ServicioInfoDto(
                bs.Servicio.Id,
                bs.Servicio.Nombre,
                bs.Servicio.Tipo,
                bs.Servicio.DuracionMinutos,
                bs.Servicio.Precio))
            .ToListAsync();
    }

    public async Task<HuecosResult> GetHuecosAsync(int barberoId, DateTime fecha, int duracionMinutos)
    {
        var timezoneId = _config["Barberia:TimeZone"];
        var timezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId!);
        var actualDayName = fecha.DayOfWeek.ToString();
        var actualDate = fecha.ToString("yyyy-MM-dd");

        var horario = await _context.HorariosDisponibles
            .FirstOrDefaultAsync(h => h.BarberoId == barberoId && h.DiaSemana == fecha.DayOfWeek && h.Activo);

        if (horario == null)
            return new HuecosResult(
                Available: false,
                AvailableSlots: [],
                ActualDate: actualDate,
                ActualDayOfWeek: actualDayName,
                Message: $"The barber does not work on {actualDayName}s. available_slots is empty. DO NOT book. Tell the client there are no slots on {actualDayName} {actualDate} and ask them to pick another date."
            );

        var turnos = await _context.Turnos
            .Where(t => t.BarberoId == barberoId && t.Estado != "cancelado")
            .Select(t => new { t.FechaHora, t.FechaHoraFin })
            .ToListAsync();

        var slots = new List<string>();
        var hora = horario.HoraInicio;
        while (hora.AddMinutes(duracionMinutos) <= horario.HoraFin)
        {
            var slotLocal = new DateTime(fecha.Year, fecha.Month, fecha.Day, hora.Hour, hora.Minute, 0, DateTimeKind.Unspecified);
            var slotUtc = TimeZoneInfo.ConvertTimeToUtc(slotLocal, timezone);
            var slotFinUtc = slotUtc.AddMinutes(duracionMinutos);
            var disponible = !turnos.Any(t => t.FechaHora < slotFinUtc && t.FechaHoraFin > slotUtc);
            if (disponible) slots.Add(hora.ToString("HH:mm"));
            hora = hora.AddMinutes(15);
        }

        return new HuecosResult(
            Available: slots.Count > 0,
            AvailableSlots: slots,
            ActualDate: actualDate,
            ActualDayOfWeek: actualDayName
        );
    }

    public async Task<CrearTurnoResult> CrearTurnoAsync(int barberoId, int servicioBaseId, List<int> addonIds, string fechaHoraStr, int usuarioId)
    {
        var todosIds = new List<int> { servicioBaseId };
        todosIds.AddRange(addonIds);

        var servicios = await _context.Servicios
            .Where(s => todosIds.Contains(s.Id))
            .ToListAsync();

        if (servicios.Count != todosIds.Count)
            return new CrearTurnoResult(Success: false, Error: "Some services do not exist.");

        var tz = TimeZoneInfo.FindSystemTimeZoneById(_config["Barberia:TimeZone"]!);
        var fechaLocal = DateTime.Parse(fechaHoraStr);
        var fechaUtc = TimeZoneInfo.ConvertTimeToUtc(fechaLocal, tz);
        var duracionTotal = servicios.Sum(s => s.DuracionMinutos);
        var precioTotal = servicios.Sum(s => s.Precio);
        var fechaFinUtc = fechaUtc.AddMinutes(duracionTotal);

        var horario = await _context.HorariosDisponibles
            .FirstOrDefaultAsync(h => h.BarberoId == barberoId && h.DiaSemana == fechaLocal.DayOfWeek && h.Activo);

        if (horario == null)
            return new CrearTurnoResult(Success: false, Error: "The barber has no schedule on that day.");

        var slotTime = new TimeOnly(fechaLocal.Hour, fechaLocal.Minute);
        var slotEnd = slotTime.AddMinutes(duracionTotal);
        if (slotTime < horario.HoraInicio || slotEnd > horario.HoraFin)
            return new CrearTurnoResult(Success: false, Error: "The requested time slot is outside the barber's working hours.");

        var conflict = await _context.Turnos
            .AnyAsync(t => t.BarberoId == barberoId && t.Estado != "cancelado"
                           && t.FechaHora < fechaFinUtc && t.FechaHoraFin > fechaUtc);

        if (conflict)
            return new CrearTurnoResult(Success: false, Error: "That time slot is no longer available. Please choose another.");

        var turno = new Turno
        {
            FechaHora = fechaUtc,
            FechaHoraFin = fechaFinUtc,
            BarberoId = barberoId,
            UsuarioId = usuarioId,
            ServicioId = servicioBaseId,
            PrecioTotal = precioTotal
        };
        _context.Turnos.Add(turno);
        await _context.SaveChangesAsync();

        foreach (var sId in todosIds)
            _context.TurnoServicios.Add(new TurnoServicio { TurnoId = turno.Id, ServicioId = sId });
        await _context.SaveChangesAsync();

        return new CrearTurnoResult(
            Success: true,
            TurnoId: turno.Id,
            FechaHora: turno.FechaHora,
            FechaHoraFin: turno.FechaHoraFin,
            DuracionMinutos: duracionTotal,
            PrecioTotal: precioTotal,
            Servicios: servicios.Select(s => s.Nombre).ToList()
        );
    }
}
