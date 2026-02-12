import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Ticket } from "lucide-react"
import type { CouponPage } from "../../types"

interface ViewerCouponProps {
    page: CouponPage
}

export function ViewerCoupon({ page }: ViewerCouponProps) {
    const [redeemedDetails, setRedeemedDetails] = useState<Record<string, boolean>>({})

    const handleRedeem = (id: string) => {
        setRedeemedDetails(prev => ({ ...prev, [id]: true }))
    }

    return (
        <div className="flex h-full flex-col items-center justify-start pt-20 md:justify-center md:pt-6 p-6 overflow-y-auto custom-scrollbar">
            <h2 className="text-4xl font-bold text-center text-[var(--color-editor-primary-dark)] mb-2 font-handwriting transform -rotate-2">
                Love Coupons
            </h2>
            <p className="text-[var(--color-neutral-600)] text-center mb-10 text-sm font-medium uppercase tracking-widest">
                Redeem wisely...
            </p>

            <div className="w-full max-w-[340px] md:max-w-2xl lg:max-w-4xl space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 pb-10">
                {page.content.coupons.map((coupon, index) => (
                    <div key={coupon.id} className="relative">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, type: "spring" }}
                            className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-[var(--color-neutral-100)] relative group"
                        >
                            {/* Decorative Perforations (Visual) */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-background-light)] border border-[var(--color-neutral-100)]"></div>
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-background-light)] border border-[var(--color-neutral-100)]"></div>
                            <div className="absolute left-[10px] right-[10px] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[var(--color-neutral-200)] pointer-events-none"></div>

                            <div className="flex flex-col">
                                {/* Top Section with Icon and Title */}
                                <div className="p-6 pb-4 bg-gradient-to-br from-[#fff0f3] to-white flex flex-col items-center text-center z-10 relative">
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--color-editor-primary)] mb-3 border border-[var(--color-editor-primary)]/20">
                                        <Ticket className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-serif text-[var(--color-neutral-800)] leading-tight">
                                        {coupon.title}
                                    </h3>
                                </div>

                                {/* Bottom Section with Description and Action */}
                                <div className="p-6 pt-4 bg-white flex flex-col items-center text-center z-10 relative">
                                    {/* Description removed */}

                                    {!redeemedDetails[coupon.id] ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRedeem(coupon.id)}
                                            className="bg-[var(--color-editor-primary)] text-white px-8 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase shadow-md hover:bg-[var(--color-editor-primary-dark)] transition-colors hover:shadow-lg"
                                        >
                                            Redeem
                                        </motion.button>
                                    ) : (
                                        <div className="bg-green-50 text-green-600 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest border border-green-200 flex items-center gap-2">
                                            <span className="material-icons-round text-base">check</span>
                                            Redeemed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Confetti / Love Animation Overlay */}
                        <AnimatePresence>
                            {redeemedDetails[coupon.id] && (
                                <FloatingHearts key={`hearts-${coupon.id}`} />
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}


// Canvas-based particle system for high performance
function FloatingHearts() {
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        // Auto-close after 6 seconds
        const timer = setTimeout(() => {
            setVisible(false)
        }, 6000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!canvasRef || !visible) return

        const canvas = canvasRef
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas to full screen
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Heart particle class
        class Heart {
            x: number
            y: number
            size: number
            speed: number
            rotation: number
            rotationSpeed: number
            color: string
            opacity: number

            constructor() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height - canvas.height // Start above screen
                this.size = Math.random() * 20 + 10 // 10-30px
                this.speed = Math.random() * 3 + 2 // 2-5px/frame
                this.rotation = Math.random() * 360
                this.rotationSpeed = (Math.random() - 0.5) * 2
                // Solid reds as requested
                const colors = ["#ff0000", "#ff1744", "#d50000", "#f44336"]
                this.color = colors[Math.floor(Math.random() * colors.length)]
                this.opacity = 1
            }

            update() {
                this.y += this.speed
                this.rotation += this.rotationSpeed

                // Reset if falls below screen
                if (this.y > canvas.height + 50) {
                    this.y = -50
                    this.x = Math.random() * canvas.width
                }
            }

            draw() {
                if (!ctx) return

                ctx.save()
                ctx.translate(this.x, this.y)
                ctx.rotate((this.rotation * Math.PI) / 180)
                ctx.globalAlpha = this.opacity
                ctx.fillStyle = this.color

                // Draw heart path
                ctx.beginPath()
                const s = this.size / 30 // Scale factor (path is roughly 30x30)
                ctx.moveTo(0, 0)
                ctx.bezierCurveTo(-15 * s, -15 * s, -30 * s, 10 * s, 0, 30 * s)
                ctx.bezierCurveTo(30 * s, 10 * s, 15 * s, -15 * s, 0, 0)
                ctx.fill()

                ctx.restore()
            }
        }

        // Initialize 400 hearts
        const hearts: Heart[] = Array.from({ length: 400 }, () => new Heart())

        let animationFrame: number
        let startTime = Date.now()
        // Fade in/out logic variables
        let globalOpacity = 0

        const render = () => {
            if (!ctx) return

            const elapsed = Date.now() - startTime

            // Calculate global opacity for smooth fade in/out
            if (elapsed < 500) {
                globalOpacity = elapsed / 500 // Fade in
            } else if (elapsed > 5500) {
                globalOpacity = Math.max(0, 1 - (elapsed - 5500) / 500) // Fade out
            } else {
                globalOpacity = 1
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw opaque background with fade
            ctx.fillStyle = `rgba(255, 240, 245, ${0.9 * globalOpacity})` // pink-50 with 0.9 max opacity
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            hearts.forEach(heart => {
                heart.update()
                // Multiply heart opacity by global opacity
                const originalOpacity = heart.opacity
                heart.opacity = globalOpacity
                heart.draw()
                heart.opacity = originalOpacity
            })

            animationFrame = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            cancelAnimationFrame(animationFrame)
        }
    }, [canvasRef, visible])

    if (!visible) return null

    return createPortal(
        <canvas
            ref={setCanvasRef}
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{ touchAction: "none" }}
        />,
        document.body
    )
}
