using Resend;

namespace TurnoApp.Services;

public class EmailService
{
    private readonly IResend _resend;
    private readonly string _from;
    private readonly string _timezoneId;

    public EmailService(IResend resend, IConfiguration config)
    {
        _resend = resend;
        _from = config["Resend:FromEmail"] ?? "onboarding@resend.dev";
        _timezoneId = config["Barberia:TimeZone"] ?? "Europe/Dublin";
    }

    private string FormatDate(DateTime utcDate)
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById(_timezoneId);
        var local = TimeZoneInfo.ConvertTimeFromUtc(utcDate, tz);
        return local.ToString("dddd, MMMM d yyyy 'at' h:mm tt");
    }

    public async Task SendBookingConfirmationAsync(string toEmail, string clientName, string barberName, string services, DateTime fechaHora, decimal precio)
    {
        try
        {
            var msg = new EmailMessage
            {
                From = _from,
                Subject = "Appointment booked ✂️",
                HtmlBody = BuildEmail(
                    title: "Appointment Booked!",
                    subtitle: $"Hi {clientName}, your appointment has been received and is pending confirmation.",
                    details: [("Barber", barberName), ("Service", services), ("Date & Time", FormatDate(fechaHora)), ("Total", $"${precio}")],
                    color: "#198754"
                )
            };
            msg.To.Add(toEmail);
            await _resend.EmailSendAsync(msg);
        }
        catch { /* don't fail the request if email fails */ }
    }

    public async Task SendAppointmentConfirmedAsync(string toEmail, string clientName, string barberName, string services, DateTime fechaHora)
    {
        try
        {
            var msg = new EmailMessage
            {
                From = _from,
                Subject = "Appointment confirmed ✅",
                HtmlBody = BuildEmail(
                    title: "Appointment Confirmed!",
                    subtitle: $"Hi {clientName}, your barber confirmed your appointment. See you soon!",
                    details: [("Barber", barberName), ("Service", services), ("Date & Time", FormatDate(fechaHora))],
                    color: "#0f3460"
                )
            };
            msg.To.Add(toEmail);
            await _resend.EmailSendAsync(msg);
        }
        catch { }
    }

    public async Task SendCancellationAsync(string toEmail, string clientName, string barberName, DateTime fechaHora)
    {
        try
        {
            var msg = new EmailMessage
            {
                From = _from,
                Subject = "Appointment cancelled",
                HtmlBody = BuildEmail(
                    title: "Appointment Cancelled",
                    subtitle: $"Hi {clientName}, your appointment has been cancelled.",
                    details: [("Barber", barberName), ("Date & Time", FormatDate(fechaHora))],
                    color: "#dc3545"
                )
            };
            msg.To.Add(toEmail);
            await _resend.EmailSendAsync(msg);
        }
        catch { }
    }

    private static string BuildEmail(string title, string subtitle, (string Label, string Value)[] details, string color)
    {
        var rows = string.Join("", details.Select(d => $"""
            <tr>
                <td style="padding:8px 0;color:#6c757d;font-size:13px;width:40%">{d.Label}</td>
                <td style="padding:8px 0;font-weight:600;font-size:14px">{d.Value}</td>
            </tr>
        """));

        return $"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f8f9fa;font-family:Arial,sans-serif">
            <div style="max-width:480px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                <div style="background:linear-gradient(135deg,#1a1a2e 0%,#0f3460 100%);padding:32px;text-align:center">
                    <span style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px">✂ TurnoApp</span>
                </div>
                <div style="padding:32px">
                    <div style="width:48px;height:4px;background:{color};border-radius:2px;margin-bottom:16px"></div>
                    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e">{title}</h1>
                    <p style="margin:0 0 24px;color:#6c757d;font-size:14px">{subtitle}</p>
                    <div style="background:#f8f9fa;border-radius:8px;padding:16px 20px">
                        <table style="width:100%;border-collapse:collapse">{rows}</table>
                    </div>
                </div>
                <div style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center">
                    <p style="margin:0;color:#adb5bd;font-size:12px">TurnoApp · Barbershop booking</p>
                </div>
            </div>
        </body>
        </html>
        """;
    }
}
