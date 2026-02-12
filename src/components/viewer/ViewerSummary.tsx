import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import type { SummaryPage } from "../../types"

interface ViewerSummaryProps {
    page: SummaryPage
}

export function ViewerSummary({ page }: ViewerSummaryProps) {
    return (
        <div className="flex h-full flex-col items-center justify-start pt-20 md:justify-center md:pt-8 p-8 text-center text-[var(--color-neutral-900)] overflow-y-auto custom-scrollbar">
            <div className="min-h-min flex flex-col items-center justify-center w-full py-8">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-8 shrink-0"
                >
                    <Heart className="h-24 w-24 fill-[var(--color-editor-primary)] text-[var(--color-editor-primary)] drop-shadow-sm" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full"
                >
                    <h2 className="text-4xl font-serif italic text-[var(--color-neutral-900)] mb-8">Happy Valentine's Day</h2>
                    <div className="max-w-md md:max-w-2xl mx-auto">
                        <p className="text-3xl leading-relaxed font-handwriting text-[var(--color-neutral-800)] whitespace-pre-wrap">
                            {page.content.message || "I love you!"}
                        </p>
                    </div>

                    <div className="mt-12 text-xs font-bold text-[var(--color-neutral-400)] uppercase tracking-widest">
                        Made with Love
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
