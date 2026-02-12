import { Heart } from "lucide-react"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
    text?: string
}

export function LoadingSpinner({ size = "md", className = "", text = "Loading..." }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className="relative">
                {/* Pulsing background heart */}
                <Heart className={`${sizeClasses[size]} text-[var(--color-editor-primary)]/30 animate-ping absolute top-0 left-0`} fill="currentColor" />
                {/* Bouncing foreground heart */}
                <Heart className={`${sizeClasses[size]} text-[var(--color-editor-primary)] animate-bounce`} fill="currentColor" />
            </div>
            {text && (
                <p className="text-[var(--color-neutral-600)] text-sm font-medium animate-pulse uppercase tracking-widest">
                    {text}
                </p>
            )}
        </div>
    )
}
