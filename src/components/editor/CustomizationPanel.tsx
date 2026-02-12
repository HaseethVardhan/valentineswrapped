import { Palette, Type, MousePointerClick, Music } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { Input } from "../ui/input"
import { useEditorStore } from "../../lib/store"

interface CustomizationPanelProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CustomizationPanel({ open, onOpenChange }: CustomizationPanelProps) {
    const { wrapped } = useEditorStore()

    if (!wrapped) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Customize</SheetTitle>
                    <SheetDescription>
                        Style your Wrapped experience.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="style" className="mt-6 w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
                        <TabsTrigger value="global" className="flex-1">Global</TabsTrigger>
                    </TabsList>

                    <TabsContent value="style" className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-medium">
                                <Palette className="h-4 w-4" />
                                <span>Theme Colors</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#000000'].map((color) => (
                                    <button
                                        key={color}
                                        className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            // TODO: Implement theme update logic
                                            console.log('Set theme color', color)
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-medium">
                                <Type className="h-4 w-4" />
                                <span>Typography</span>
                            </div>
                            <div className="grid gap-2">
                                <Label>Font Family</Label>
                                {/* Font selector placeholder */}
                                <div className="rounded-md border p-2 text-sm text-muted-foreground">
                                    Sans-serif (Default)
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-medium">
                                <MousePointerClick className="h-4 w-4" />
                                <span>Animations</span>
                            </div>
                            <div className="grid gap-2">
                                <Label>Intensity</Label>
                                <Slider defaultValue={[50]} max={100} step={1} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="global" className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-medium">
                                <Music className="h-4 w-4" />
                                <span>Background Music</span>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bgMusic">Spotify/YouTube URL</Label>
                                <Input
                                    id="bgMusic"
                                    placeholder="Song for the whole experience"
                                    value={wrapped.bgMusicUrl || ''}
                                // onChange={(e) => updateWrapped({ bgMusicUrl: e.target.value })} 
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
