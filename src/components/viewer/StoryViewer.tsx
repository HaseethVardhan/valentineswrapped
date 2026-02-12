import { useState, useCallback } from "react" // Removed useEffect
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react" // Import icons
import type { Wrapped } from "../../types"
import { ViewerScrapbook } from "./ViewerScrapbook"
import { ViewerCoupon } from "./ViewerCoupon"
import { ViewerSummary } from "./ViewerSummary"
import { ViewerFinalPage } from "./ViewerFinalPage"

interface StoryViewerProps {
    wrapped: Wrapped
}

export function StoryViewer({ wrapped }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    // const [isPaused, setIsPaused] = useState(false) // Removed pause state

    const pages = wrapped.pages

    const currentPage = pages[currentIndex]

    const goToNext = useCallback(() => {
        // Allow going one step PAST the length for the final page
        if (currentIndex < pages.length) {
            setCurrentIndex((prev) => prev + 1)
        }
    }, [currentIndex, pages.length])

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
        }
    }, [currentIndex])

    // Removed Auto-advance useEffect

    // if (!currentPage) return <div>End of Wrapped</div> // Handled in render now

    return (
        <div className="relative h-full w-full overflow-hidden group"> {/* Added group for hover effects */}
            {/* Progress Bars (Static now?) or keep them to show progress? Let's keep them but static/manual */}
            <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
                {pages.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 rounded-full bg-[var(--color-neutral-200)] overflow-hidden">
                        <div
                            className={`h-full bg-[var(--color-editor-primary)] transition-all duration-300 ease-linear ${idx <= currentIndex ? 'w-full' : 'w-0'}`} // Simply fill based on index
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Buttons (Visible on Hover or Always?) Let's make them always visible but subtle, or visible on hover */}
            {/* Left Button */}
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 ${currentIndex > 0 ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="p-3 rounded-full bg-black/10 backdrop-blur-md text-[var(--color-neutral-800)] hover:bg-black/20 hover:scale-110 transition-all shadow-sm"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            </div>

            {/* Right Button */}
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 ${currentIndex < pages.length ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="p-3 rounded-full bg-black/10 backdrop-blur-md text-[var(--color-neutral-800)] hover:bg-black/20 hover:scale-110 transition-all shadow-sm"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            {/* Navigation Touch Zones (Keep for mobile/ease of use, but logic is manual) */}
            {/* Navigation Touch Zones (Removed to allow scrolling, using buttons instead) */}
            {/* If we want touch support later, we should use swipe handlers that don't block clicks/scrolls */}

            {/* Content */}
            <div className="relative z-10 h-full w-full flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {currentPage ? (
                        <motion.div
                            key={currentPage.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.75, ease: "easeInOut" }} // Updated duration
                            className="h-full w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto"
                        >
                            {/* Render Page Type */}
                            {currentPage.type === 'scrapbook' && <ViewerScrapbook page={currentPage} />}
                            {currentPage.type === 'coupon' && <ViewerCoupon page={currentPage} />}
                            {currentPage.type === 'summary' && <ViewerSummary page={currentPage} />}
                        </motion.div>
                    ) : (
                        // Final Page (currentIndex === pages.length)
                        <motion.div
                            key="final-page"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }} // Slower fade for final page
                            className="h-full w-full absolute inset-0 z-50"
                        >
                            <ViewerFinalPage />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
