using System.ComponentModel.DataAnnotations;

namespace TurnoApp.DTOs;

public class RegistroUsuarioDTO
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    public string Nombre { get; set; } = null!;
    [Required(ErrorMessage = "El apellido es obligatorio.")]
    public string Apellido { get; set; } = null!;
    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "Debe ingresar un correo electrónico válido.")]
    public string Email { get; set; } = null!;
    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 100 caracteres.")]
    public string Password { get; set; } = null!;
}