import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import type { SummaryPage } from "../../types"

interface SummaryEditorProps {
    page: SummaryPage
    onUpdate: (updates: Partial<SummaryPage>) => void
}

export function SummaryEditor({ page, onUpdate }: SummaryEditorProps) {
    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center">
                <h3 className="text-lg font-medium">Final Message</h3>
                <p className="text-sm text-muted-foreground">Wrap it up with a heartfelt note.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Closing Message</Label>
                <Textarea
                    id="message"
                    placeholder="Thank you for being my valentine..."
                    value={page.content.message}
                    onChange={(e) => onUpdate({ content: { ...page.content, message: e.target.value } })}
                    className="min-h-[200px]"
                />
            </div>
        </div>
    )
}
