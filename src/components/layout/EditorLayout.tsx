import React from "react"
import { ArrowLeft, Eye, Layers, Palette, Plus, Save } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface EditorLayoutProps {
    children: React.ReactNode
    title?: string
    onTitleChange?: (title: string) => void
    onBack?: () => void
    onPreview?: () => void
    onCreate?: () => void
    onTogglePages?: () => void
    onAddPage?: () => void
    onCustomize?: () => void
    isSaving?: boolean
}

export function EditorLayout({
    children,
    title = "",
    onTitleChange,
    onBack,
    onPreview,
    onCreate,
    onTogglePages,
    onAddPage,
    onCustomize,
    isSaving = false,
}: EditorLayoutProps) {
    return (
        <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* Top Bar */}
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-1 items-center justify-center px-4">
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange?.(e.target.value)}
                        placeholder="Untitled Wrapped"
                        className="max-w-[200px] border-none bg-transparent text-center font-medium shadow-none focus-visible:ring-0 md:max-w-[300px]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {isSaving && (
                        <span className="mr-2 hidden text-xs text-muted-foreground sm:inline-block">
                            Saving...
                        </span>
                    )}
                    <Button variant="ghost" size="icon" onClick={onPreview}>
                        <Eye className="h-5 w-5" />
                    </Button>
                    <Button size="sm" onClick={onCreate} className="hidden sm:flex">
                        Create
                    </Button>
                    <Button size="icon" onClick={onCreate} className="sm:hidden">
                        <Save className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Canvas */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <div className="mx-auto h-full max-w-md overflow-hidden rounded-xl border bg-white shadow-lg dark:border-slate-800 dark:bg-black md:max-w-4xl">
                    {/* Simulate mobile view wrapper or just content */}
                    {/* For now just render children roughly centered */}
                    <div className="h-full w-full">{children}</div>
                </div>
            </main>

            {/* Bottom Toolbar */}
            <footer className="sticky bottom-0 z-10 flex h-16 items-center justify-around border-t bg-background px-4 pb-safe shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
                <Button
                    variant="ghost"
                    className="flex flex-col gap-1 text-[10px] text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={onTogglePages}
                >
                    <Layers className="h-5 w-5" />
                    Pages
                </Button>

                <Button
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg"
                    onClick={onAddPage}
                >
                    <Plus className="h-6 w-6" />
                </Button>

                <Button
                    variant="ghost"
                    className="flex flex-col gap-1 text-[10px] text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={onCustomize}
                >
                    <Palette className="h-5 w-5" />
                    Style
                </Button>
            </footer>
        </div>
    )
}
