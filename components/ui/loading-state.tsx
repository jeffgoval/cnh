import { Loader2 } from "lucide-react"

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
    return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">{message}</p>
        </div>
    )
}

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
}
