'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { maskCurrency } from "@/lib/utils/money"

export interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string | number
    onChange: (value: string) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        // Ensure value is formatted correctly on initial render and updates
        const displayValue = typeof value === 'number'
            ? maskCurrency(value.toString())
            : maskCurrency(value)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const maskedValue = maskCurrency(e.target.value)
            onChange(maskedValue)
        }

        return (
            <Input
                type="text"
                className={className}
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                placeholder="R$ 0,00"
                {...props}
            />
        )
    }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
