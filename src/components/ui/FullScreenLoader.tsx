import { Heart } from "lucide-react"

interface FullScreenLoaderProps {
    message?: string
    show: boolean
}

/**
 * Full-screen loading overlay that blocks all interaction
 */
export function FullScreenLoader({ message = "Loading...", show }: FullScreenLoaderProps) {
    if (!show) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4">
                <div className="relative">
                    {/* Pulsing background heart */}
                    <Heart className="w-16 h-16 text-[var(--color-editor-primary)]/30 animate-ping absolute top-0 left-0" fill="currentColor" />
                    {/* Bouncing foreground heart */}
                    <Heart className="w-16 h-16 text-[var(--color-editor-primary)] animate-bounce" fill="currentColor" />
                </div>
                <div className="text-center">
                    <p className="text-[var(--color-neutral-800)] text-lg font-semibold mb-1">
                        {message}
                    </p>
                    <p className="text-[var(--color-neutral-500)] text-sm">
                        Please wait...
                    </p>
                </div>
            </div>
        </div>
    )
}
