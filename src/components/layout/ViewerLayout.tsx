import React from "react"
import { cn } from "../../lib/utils"

interface ViewerLayoutProps {
    children: React.ReactNode
    className?: string
}

export function ViewerLayout({ children, className }: ViewerLayoutProps) {
    return (
        <div
            className={cn(
                "fixed inset-0 flex h-full w-full flex-col overflow-hidden bg-transparent text-[var(--color-neutral-900)]",
                className
            )}
        >
            <div className="relative z-10 flex h-full w-full flex-col">
                {children}
            </div>
        </div>
    )
}
