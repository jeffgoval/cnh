'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heading, Text } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterSheetProps {
    isOpen: boolean
    onClose: () => void
    selectedCategories: string[]
    onCategoriesChange: (categories: string[]) => void
    onApply: () => void
}

const CATEGORIES = [
    { value: 'A', label: 'Categoria A', description: 'Motocicletas' },
    { value: 'B', label: 'Categoria B', description: 'Automóveis' },
    { value: 'AB', label: 'Categoria AB', description: 'Moto e Carro' },
    { value: 'ACC', label: 'Categoria ACC', description: 'Veículos de carga' },
    { value: 'E', label: 'Categoria E', description: 'Combinações' },
]

export function FilterSheet({
    isOpen,
    onClose,
    selectedCategories,
    onCategoriesChange,
    onApply
}: FilterSheetProps) {
    if (!isOpen) return null

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoriesChange(selectedCategories.filter(c => c !== category))
        } else {
            onCategoriesChange([...selectedCategories, category])
        }
    }

    const clearAll = () => {
        onCategoriesChange([])
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
                onClick={onClose}
            />

            {/* Bottom Sheet (mobile) / Modal (desktop) */}
            <div className={cn(
                "fixed z-50 bg-background",
                "bottom-0 left-0 right-0 rounded-t-2xl",
                "md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
                "md:max-w-md md:rounded-2xl",
                "animate-in slide-in-from-bottom md:slide-in-from-top",
                "max-h-[85vh] overflow-y-auto"
            )}>
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Heading level={2}>Filtros</Heading>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Heading level={4}>Categoria</Heading>
                            {selectedCategories.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAll}
                                    className="h-auto p-0 text-[13px]"
                                >
                                    Limpar
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {CATEGORIES.map((category) => {
                                const isSelected = selectedCategories.includes(category.value)
                                return (
                                    <Card
                                        key={category.value}
                                        className={cn(
                                            "cursor-pointer transition-all hover:border-primary/30",
                                            isSelected && "border-primary bg-primary/5"
                                        )}
                                        onClick={() => toggleCategory(category.value)}
                                    >
                                        <CardContent className="p-4 min-h-[60px]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <Text variant="bodyMd" className="font-medium">
                                                        {category.label}
                                                    </Text>
                                                    <Text variant="small">
                                                        {category.description}
                                                    </Text>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                        <Check className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={onApply}
                        >
                            Aplicar filtros
                            {selectedCategories.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {selectedCategories.length}
                                </Badge>
                            )}
                        </Button>
                        <Text variant="small" className="text-center text-muted-foreground">
                            Você pode ajustar depois
                        </Text>
                    </div>
                </div>
            </div>
        </>
    )
}
