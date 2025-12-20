export function formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return 'R$ 0,00'
    const amount = typeof value === 'string' ? parseFloat(value.replace(',', '.')) || 0 : value
    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })
}

export function parseCurrencyToDecimal(value: string): number {
    if (!value) return 0
    const cleaned = value.replace(/[^\d]/g, '')
    return (parseInt(cleaned) || 0) / 100
}

export function maskCurrency(value: string): string {
    if (!value) return 'R$ 0,00'
    const cleaned = value.toString().replace(/[^\d]/g, '')
    const amount = (parseInt(cleaned) || 0) / 100
    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })
}
