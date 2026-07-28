"use client"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SUPPORTED_CURRENCIES } from "@/lib/types/invoice"

interface CurrencySelectorProps {
    value: string
    onChange: (currency: string) => void
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
                Currency
            </Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id="currency" className="w-full">
                    <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">{currency.symbol}</span>
                                <span>{currency.code}</span>
                                <span className="text-slate-500">- {currency.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
