namespace TurnoApp.Services;

public interface ITurnoService
{
    Task<List<BarberoInfoDto>> GetBarberosAsync();
    Task<List<ServicioInfoDto>> GetServiciosAsync(int barberoId);
    Task<HuecosResult> GetHuecosAsync(int barberoId, DateTime fecha, int duracionMinutos);
    Task<CrearTurnoResult> CrearTurnoAsync(int barberoId, int servicioBaseId, List<int> addonIds, string fechaHoraStr, int usuarioId);
}

public record BarberoInfoDto(int Id, string Nombre);
public record ServicioInfoDto(int Id, string Nombre, string Tipo, int DuracionMinutos, decimal Precio);

public record HuecosResult(
    bool Available,
    List<string> AvailableSlots,
    string ActualDate,
    string ActualDayOfWeek,
    string? Message = null
);

public record CrearTurnoResult(
    bool Success,
    int? TurnoId = null,
    string? Error = null,
    DateTime? FechaHora = null,
    DateTime? FechaHoraFin = null,
    int? DuracionMinutos = null,
    decimal? PrecioTotal = null,
    List<string>? Servicios = null
);
