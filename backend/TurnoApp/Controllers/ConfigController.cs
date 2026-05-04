using Microsoft.AspNetCore.Mvc;

namespace TurnoApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly IConfiguration _config;

    public ConfigController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet("timezone")]
    public IActionResult GetTimezone()
    {
        var timezone = _config["Barberia:TimeZone"];
        return Ok(timezone);
    }
}