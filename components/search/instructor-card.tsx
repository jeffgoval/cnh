'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heading, Text } from '@/components/ui/typography'
import { Check, Star, Car, Bike } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/money'

interface InstructorCardProps {
    id: string
    name: string
    photo?: string | null
    categoria: 'A' | 'B' | 'AB' | 'ACC'
    distance?: number
    price: number
    featured?: boolean
    verified?: boolean
    onClick: () => void
}

export function InstructorCard({
    name,
    photo,
    categoria,
    distance,
    price,
    featured = false,
    verified = false,
    onClick
}: InstructorCardProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            'A': 'Moto',
            'B': 'Carro',
            'AB': 'Moto e Carro',
            'ACC': 'Carga',
        }
        return labels[cat] || cat
    }

    return (
        <Card
            className="hover:border-primary/30 transition-colors cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="p-4 min-h-[88px]">
                <div className="flex items-center gap-4">
                    {/* Photo */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={photo || undefined} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Heading level={4} className="truncate">{name}</Heading>
                            {featured && (
                                <Badge variant="outline" className="gap-1 flex-shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-[11px]">Destaque</span>
                                </Badge>
                            )}
                            {verified && (
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                            <div className="flex items-center gap-1">
                                {(categoria === 'A' || categoria === 'AB') ? (
                                    <Bike className="h-3.5 w-3.5" />
                                ) : (
                                    <Car className="h-3.5 w-3.5" />
                                )}
                                <Text variant="small">{getCategoryLabel(categoria)}</Text>
                            </div>
                            {distance !== undefined && (
                                <>
                                    <span className="text-[11px]">•</span>
                                    <Text variant="small">{distance.toFixed(1)} km</Text>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                        <Heading level={4}>{formatCurrency(price)}</Heading>
                        <Text variant="small">por aula</Text>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
