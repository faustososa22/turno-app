using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurnoApp.Migrations
{
    /// <inheritdoc />
    public partial class AgregaPrecioTotalATurno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrecioTotal",
                table: "Turnos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecioTotal",
                table: "Turnos");
        }
    }
}
