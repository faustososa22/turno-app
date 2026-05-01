using Microsoft.AspNetCore.Mvc;
using TurnoApp.Data;

namespace TurnoApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BarberosController : ControllerBase
{
    private readonly AppDbContext context;

    public BarberosController(AppDbContext context)
    {
        this.context = context;
    }
}