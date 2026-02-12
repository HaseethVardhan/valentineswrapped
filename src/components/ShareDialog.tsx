import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"

interface ShareDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    slug: string
}

export function ShareDialog({ open, onOpenChange, slug }: ShareDialogProps) {
    const shareUrl = `${window.location.origin}/w/${slug}`
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share the Love ❤️</DialogTitle>
                    <DialogDescription>
                        Your Valentine's Wrapped is ready! Share this link with your special someone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-4">
                    <div className="grid flex-1 gap-2">
                        <Input
                            readOnly
                            value={shareUrl}
                            className="w-full"
                        />
                    </div>
                    <Button type="button" size="sm" onClick={handleCopy} className="px-3">
                        <span className="material-icons-round text-lg">
                            {copied ? "check" : "content_copy"}
                        </span>
                    </Button>
                </div>
                <div className="mt-6 flex justify-center">
                    {/* Placeholder for QR Code - using a simple API for now or just a visual block */}
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                        alt="QR Code"
                        className="rounded-lg border border-neutral-200"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
