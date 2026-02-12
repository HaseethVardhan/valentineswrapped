import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart, Flower2, Sparkles } from "lucide-react"

export function BackgroundEffects() {
    const [mounted, setMounted] = useState(false)
    const [elements, setElements] = useState<any[]>([])

    useEffect(() => {
        setMounted(true)

        // Generate floating elements
        const items = Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            type: Math.random() > 0.6 ? "heart" : Math.random() > 0.3 ? "flower" : "glitter",
            x: Math.random() * 100,
            y: Math.random() * 100,
            scale: Math.random() * 0.5 + 0.5,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5,
            rotation: Math.random() * 360
        }))
        setElements(items)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#FFF5F7]">
            {/* Soft Ambient Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-[#fff0f5] to-red-50 opacity-80" />

            {/* SVG Noise Filter */}
            <svg className="hidden">
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </svg>

            {/* Grain Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay" style={{ filter: 'url(#noise)' }}></div>

            {elements.map((el) => (
                <FloatingElement key={el.id} data={el} />
            ))}
        </div>
    )
}

function FloatingElement({ data }: { data: any }) {
    return (
        <motion.div
            className="absolute"
            initial={{
                x: `${data.x}vw`,
                y: `${data.y}vh`,
                opacity: 0,
                scale: 0
            }}
            animate={{
                y: [
                    `${data.y}vh`,
                    `${data.y - 20}vh`,
                    `${data.y}vh`
                ],
                x: [
                    `${data.x}vw`,
                    `${data.x + (Math.random() * 10 - 5)}vw`,
                    `${data.x}vw`
                ],
                rotate: [data.rotation, data.rotation + 45, data.rotation],
                opacity: [0, 0.4, 0.4, 0],
                scale: [0, data.scale, data.scale, 0]
            }}
            transition={{
                duration: data.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: data.delay
            }}
        >
            {data.type === "heart" && (
                <Heart
                    className="text-pink-300 fill-pink-200/50 drop-shadow-sm"
                    size={data.scale * 40}
                />
            )}
            {data.type === "flower" && (
                <Flower2
                    className="text-rose-300 fill-rose-100/50 drop-shadow-sm"
                    size={data.scale * 35}
                />
            )}
            {data.type === "glitter" && (
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Sparkles
                        className="text-yellow-400 fill-yellow-200/80"
                        size={data.scale * 20}
                    />
                </motion.div>
            )}
        </motion.div>
    )
}
