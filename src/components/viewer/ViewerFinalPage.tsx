import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Sparkles, Heart } from "lucide-react"

export function ViewerFinalPage() {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center h-full w-full bg-black text-white relative overflow-hidden"
        >
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0510] to-[#2d0f1e] opacity-80" />

            {/* Stars */}
            <div className="absolute inset-0 z-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full opacity-0"
                        style={{
                            width: Math.random() * 2 + 1 + "px",
                            height: Math.random() * 2 + 1 + "px",
                            top: Math.random() * 60 + "%",
                            left: Math.random() * 100 + "%",
                        }}
                        animate={{ opacity: [0, 0.8, 0] }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Moon (Realistic Image) */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5, type: "spring", stiffness: 50 }}
                className="absolute top-[10%] z-10"
            >
                <img
                    src="/realistic_moon.png"
                    alt="Full Moon"
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full drop-shadow-[0_0_60px_rgba(253,251,211,0.4)]"
                />
            </motion.div>

            {/* Water */}
            <div className="absolute bottom-0 w-full h-[35%] overflow-hidden z-20">
                {/* Reflection */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 2, delay: 1 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full bg-[#ff99cc] blur-[60px]"
                />

                {/* Waves */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bottom-0 left-0 right-0 h-full bg-[#3d1428] opacity-60"
                        style={{ bottom: i * -20 }}
                        animate={{
                            y: [0, -10, 0],
                            scaleY: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                        }}
                    >
                        <svg viewBox="0 0 1440 320" className="w-full h-full fill-[#5e1e3c]" preserveAspectRatio="none">
                            <path d="M0,160L48,170.7C96,181,192,203,288,202.7C384,203,480,181,576,165.3C672,149,768,139,864,149.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </motion.div>
                ))}
            </div>

            {/* Boat & Couple */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 3, delay: 1.5, ease: "easeOut" }}
                className="absolute bottom-[20%] z-30"
            >
                <motion.div
                    animate={{
                        rotate: [1, -1, 1],
                        y: [0, 5, 0]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative"
                >
                    {/* Boat SVG */}
                    <svg width="180" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                        {/* Hull */}
                        <path d="M20 80 Q 100 120 180 80 L 170 60 L 30 60 Z" fill="#4a2c20" />
                        {/* Mast */}
                        <path d="M100 60 L 100 10" stroke="#6b442a" strokeWidth="3" />
                        {/* Sail */}
                        <path d="M102 12 Q 130 30 102 55 Z" fill="#e0e0e0" opacity="0.9" />

                        {/* Couple (Simplified Silhouettes) */}
                        <g transform="translate(70, 45)">
                            {/* Person 1 */}
                            <circle cx="10" cy="5" r="5" fill="#1a0510" />
                            <path d="M5 10 Q 10 25 15 10" stroke="#1a0510" strokeWidth="0" fill="#1a0510" />
                            <rect x="2" y="10" width="16" height="18" rx="4" fill="#1a0510" />
                        </g>
                        <g transform="translate(100, 48)">
                            {/* Person 2 */}
                            <circle cx="10" cy="5" r="5" fill="#1a0510" />
                            <rect x="2" y="10" width="16" height="15" rx="4" fill="#1a0510" />
                        </g>
                        {/* Tiny Heart between them */}
                        <motion.g
                            transform="translate(93, 35)"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <path d="M0 0 L 5 5 L 10 0 C 12 -2 14 0 10 4 L 5 9 L 0 4 C -4 0 -2 -2 0 0 Z" fill="#ff4d88" />
                        </motion.g>
                    </svg>
                </motion.div>
            </motion.div>

            {/* Text & Button */}
            <div className="absolute inset-x-0 top-[28%] z-40 text-center space-y-8 px-6 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 2.5 }}
                    className="space-y-4"
                >
                    <h2 className="text-3xl md:text-5xl font-serif text-[#ffe6f2] drop-shadow-[0_2px_10px_rgba(255,105,180,0.5)]">
                        Here's to love that grows.
                    </h2>
                    <p className="text-lg md:text-xl text-pink-200/80 font-light italic">
                        Every story is worth celebrating.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 3.5 }}
                className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-50 w-full flex justify-center px-4"
            >
                <Button
                    onClick={() => navigate("/")}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-pink-100 border border-pink-500/30 rounded-full px-8 py-6 text-lg font-serif tracking-wide shadow-[0_0_30px_rgba(255,105,180,0.3)] hover:shadow-[0_0_50px_rgba(255,105,180,0.5)] transition-all duration-500 group"
                >
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-300 animate-pulse" />
                        Create your own Wrapped
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform" />
                    </span>
                </Button>
            </motion.div>
        </motion.div>
    )
}
