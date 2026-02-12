import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, Heart } from "lucide-react"

interface IntroSequenceProps {
    onComplete: () => void
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
    const [stage, setStage] = useState(0)

    useEffect(() => {
        // Timeline of events
        const timeline = [
            { time: 1000, action: () => setStage(1) }, // Show "Turn up volume"
            { time: 4000, action: () => setStage(2) }, // Fade out text, start growing flowers
            { time: 5000, action: () => setStage(3) }, // Background transition
            // Wait for user interaction instead of auto-completing

        ]

        const timeouts = timeline.map(({ time, action }) => setTimeout(action, time))

        return () => timeouts.forEach(clearTimeout)
    }, [onComplete])

    // Flower positions and delays for "growing" effect
    // Edges: Top-Left, Top-Right, Bottom-Left, Bottom-Right
    const decorations = [
        // Top Left
        { id: 1, type: 'flower', x: '5%', y: '5%', delay: 0 },
        { id: 2, type: 'heart', x: '15%', y: '8%', delay: 0.2 },
        { id: 3, type: 'flower', x: '8%', y: '15%', delay: 0.4 },

        // Top Right
        { id: 4, type: 'flower', x: '95%', y: '5%', delay: 0.1 },
        { id: 5, type: 'heart', x: '85%', y: '8%', delay: 0.3 },
        { id: 6, type: 'flower', x: '92%', y: '15%', delay: 0.5 },

        // Bottom Left
        { id: 7, type: 'flower', x: '5%', y: '95%', delay: 0.1 },
        { id: 8, type: 'heart', x: '15%', y: '92%', delay: 0.3 },
        { id: 9, type: 'flower', x: '8%', y: '85%', delay: 0.5 },

        // Bottom Right
        { id: 10, type: 'flower', x: '95%', y: '95%', delay: 0.2 },
        { id: 11, type: 'heart', x: '85%', y: '92%', delay: 0.4 },
        { id: 12, type: 'flower', x: '92%', y: '85%', delay: 0.6 },
    ]

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
            initial={{ backgroundColor: "#000000" }}
            animate={{
                backgroundColor: stage >= 3 ? "rgba(0,0,0,0)" : "#000000"
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
        >
            <AnimatePresence>
                {stage === 1 && (
                    <motion.div
                        className="text-white text-center flex flex-col items-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <Volume2 className="w-16 h-16 animate-pulse" />
                        <h2 className="text-2xl font-light tracking-widest uppercase">Turn up the volume</h2>
                        <p className="text-sm text-white/60">Let the music tell our story...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {stage >= 2 && (
                <div className="absolute inset-0">
                    {decorations.map((item) => (
                        <motion.div
                            key={item.id}
                            className="absolute"
                            style={{ left: item.x, top: item.y }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                delay: item.delay,
                                duration: 1.5,
                                type: "spring",
                                bounce: 0.4
                            }}
                        >
                            {/* Simple SVG shapes for flowers/hearts to keep it lightweight but pretty */}
                            {item.type === 'heart' ? (
                                <Heart
                                    className="w-12 h-12 text-pink-400 fill-pink-400 drop-shadow-lg"
                                    fill="currentColor"
                                />
                            ) : (
                                <span className="text-4xl drop-shadow-md">🌸</span>
                            )}
                        </motion.div>
                    ))}

                    {/* Additional floating particles */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                    >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center px-4">
                            <motion.h1
                                className="text-4xl md:text-6xl font-serif text-[#8b1a1a] mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : 20 }}
                                transition={{ duration: 1 }}
                            >
                                Your Wrapped is Ready
                            </motion.h1>

                            {/* Tap to Open Button */}
                            <motion.button
                                className="bg-[#8b1a1a] text-white px-8 py-3 rounded-full text-lg tracking-widest hover:bg-[#a62b2b] transition-colors shadow-lg"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: stage >= 3 ? 1 : 0,
                                    scale: stage >= 3 ? 1 : 0.9,
                                }}
                                transition={{ duration: 0.5, delay: 1.5 }}
                                onClick={onComplete}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                TAP TO OPEN
                            </motion.button>
                        </div>
                    </motion.div>
                </div> // Remove pointer-events-none if we need interaction?
            )}
        </motion.div>
    )
}
