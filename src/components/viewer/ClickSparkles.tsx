import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface Sparkle {
    id: string
    x: number
    y: number
    color: string
    size: number
    rotation: number
}

export function ClickSparkles() {
    const [sparkles, setSparkles] = useState<Sparkle[]>([])

    const addSparkles = useCallback((e: MouseEvent) => {

        const timestamp = Date.now()
        const newSparkles: Sparkle[] = Array.from({ length: 8 }).map((_, i) => ({
            id: `${timestamp}-${i}-${Math.random()}`,
            x: e.clientX,
            y: e.clientY,
            color: Math.random() > 0.5 ? "#FFD700" : "#FF69B4", // Gold or Hot Pink
            size: Math.random() * 16 + 8,
            rotation: Math.random() * 360
        }))

        setSparkles(prev => [...prev, ...newSparkles])

        // Cleanup after animation
        setTimeout(() => {
            setSparkles(prev => prev.filter(s => !s.id.startsWith(timestamp.toString())))
        }, 1000)
    }, [])

    useEffect(() => {
        window.addEventListener('click', addSparkles)
        return () => window.removeEventListener('click', addSparkles)
    }, [addSparkles])

    return createPortal(
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <AnimatePresence>
                {sparkles.map((sparkle) => (
                    <motion.div
                        key={sparkle.id}
                        initial={{
                            x: sparkle.x,
                            y: sparkle.y,
                            scale: 0,
                            opacity: 1,
                            rotate: sparkle.rotation
                        }}
                        animate={{
                            x: sparkle.x + (Math.random() - 0.5) * 150,
                            y: sparkle.y + (Math.random() - 0.5) * 150,
                            scale: [0, 1, 0], // Pop in and out
                            opacity: [1, 1, 0],
                            rotate: sparkle.rotation + 180
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute"
                    >
                        <Sparkles
                            size={sparkle.size}
                            color={sparkle.color}
                            fill={sparkle.color}
                            className="drop-shadow-sm"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>,
        document.body
    )
}
