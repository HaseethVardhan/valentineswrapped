import * as React from "react"
import { Plus, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import type { ScrapbookPage } from "../../types"
import { api } from "../../lib/api"

interface ScrapbookEditorProps {
    page: ScrapbookPage
    onUpdate: (updates: Partial<ScrapbookPage>) => void
}

export function ScrapbookEditor({ page, onUpdate }: ScrapbookEditorProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleAddImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            // Upload to R2 via API
            // Note: In a real app we might want to show a loading state here
            const url = await api.uploadMedia(file)

            const newImage = {
                id: `img-${Date.now()}`,
                url,
                caption: "",
            }

            onUpdate({
                content: {
                    ...page.content,
                    images: [...page.content.images, newImage],
                },
            })
        } catch (error) {
            console.error("Failed to upload image", error)
            alert("Failed to upload image")
        } finally {
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveImage = (imageId: string) => {
        onUpdate({
            content: {
                ...page.content,
                images: page.content.images.filter((img) => img.id !== imageId),
            },
        })
    }

    const handleCaptionChange = (imageId: string, caption: string) => {
        onUpdate({
            content: {
                ...page.content,
                images: page.content.images.map((img) =>
                    img.id === imageId ? { ...img, caption } : img
                ),
            },
        })
    }

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Scrapbook Gallery</h3>
                <Button onClick={handleAddImageClick} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Photo
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {page.content.images.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                        <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800">
                            <img
                                src={image.url}
                                alt="Memory"
                                className="h-full w-full object-cover"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                onClick={() => handleRemoveImage(image.id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <CardContent className="p-3">
                            <Input
                                placeholder="Write a caption..."
                                value={image.caption || ""}
                                onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                                className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                            />
                        </CardContent>
                    </Card>
                ))}
                {page.content.images.length === 0 && (
                    <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 text-slate-500 dark:bg-slate-900/50">
                        <p className="mb-2 text-sm">No photos yet</p>
                        <Button variant="outline" size="sm" onClick={handleAddImageClick}>
                            Add your first photo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
