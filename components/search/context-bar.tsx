'use client'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/typography'
import { MapPin, SlidersHorizontal, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ContextBarProps {
    location?: string
    selectedCategories: string[]
    onLocationClick: () => void
    onCategoryToggle: (category: string) => void
    className?: string
}

const CATEGORIES = [
    { value: 'A', label: 'Moto' },
    { value: 'B', label: 'Carro' },
    { value: 'AB', label: 'Moto e Carro' },
    { value: 'ACC', label: 'Carga' },
]

export function SearchContextBar({
    location = 'Perto de você',
    selectedCategories,
    onLocationClick,
    onCategoryToggle,
    className
}: ContextBarProps) {
    const hasFilters = selectedCategories.length > 0

    return (
        <div className={cn('sticky top-0 z-10 bg-background/95 backdrop-blur border-b', className)}>
            {/* Context buttons */}
            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onLocationClick}
                    className="flex-shrink-0 gap-2"
                >
                    <MapPin className="h-4 w-4" />
                    <span className="text-[13px]">{location}</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "flex-shrink-0 gap-2",
                                hasFilters && "border-primary text-primary"
                            )}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="text-[13px]">
                                Categoria {hasFilters && `(${selectedCategories.length})`}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        {CATEGORIES.map((category) => {
                            const isSelected = selectedCategories.includes(category.value)
                            return (
                                <DropdownMenuItem
                                    key={category.value}
                                    onClick={() => onCategoryToggle(category.value)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[13px]">{category.label}</span>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Transparency text */}
            <div className="px-4 pb-3">
                <Text variant="small" className="text-muted-foreground">
                    Instrutores próximos de você. Destaques aparecem primeiro.
                </Text>
            </div>
        </div>
    )
}
