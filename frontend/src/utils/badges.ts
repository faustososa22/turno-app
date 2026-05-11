export function estadoVariant(estado: string): string {
    const map: Record<string, string> = {
        pendiente: 'warning',
        confirmado: 'success',
        cancelado: 'danger',
    }
    return map[estado] ?? 'secondary'
}

export function pagoVariant(estadoPago: string): string {
    return estadoPago === 'pagado' ? 'success' : 'warning'
}
