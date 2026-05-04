using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurnoApp.Migrations
{
    /// <inheritdoc />
    public partial class AgregaTipoServicio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Servicios",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Servicios");
        }
    }
}
