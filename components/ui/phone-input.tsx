'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { maskPhone } from "@/lib/utils/masks"

export interface PhoneInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onPhoneChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, value, onChange, onPhoneChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const maskedValue = maskPhone(e.target.value)

            // Update the event's value so standard onChange still works
            e.target.value = maskedValue

            if (onChange) {
                onChange(e)
            }

            if (onPhoneChange) {
                onPhoneChange(maskedValue)
            }
        }

        return (
            <Input
                type="tel"
                className={className}
                ref={ref}
                value={value}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                {...props}
            />
        )
    }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
