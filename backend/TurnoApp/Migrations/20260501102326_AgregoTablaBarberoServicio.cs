using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurnoApp.Migrations
{
    /// <inheritdoc />
    public partial class AgregoTablaBarberoServicio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BarberoServicios",
                columns: table => new
                {
                    BarberoId = table.Column<int>(type: "integer", nullable: false),
                    ServicioId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BarberoServicios", x => new { x.BarberoId, x.ServicioId });
                    table.ForeignKey(
                        name: "FK_BarberoServicios_Barberos_BarberoId",
                        column: x => x.BarberoId,
                        principalTable: "Barberos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BarberoServicios_Servicios_ServicioId",
                        column: x => x.ServicioId,
                        principalTable: "Servicios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BarberoServicios_ServicioId",
                table: "BarberoServicios",
                column: "ServicioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BarberoServicios");
        }
    }
}
