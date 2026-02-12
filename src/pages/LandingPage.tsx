import { useNavigate } from "react-router-dom"
// import { Button } from "../components/ui/button" // Using custom styled button for this page to match exact design
// import { Card } from "../components/ui/card" // Not used in new design

export function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="flex min-h-screen flex-col items-center selection:bg-primary/20 bg-secondary text-foreground font-sans">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 md:px-10 flex justify-between items-center bg-gradient-to-b from-secondary/90 to-transparent backdrop-blur-[1px]">
                <div className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <span className="font-serif italic text-2xl md:text-3xl text-primary tracking-tight">valentineswrapped</span>
                </div>
                <button className="group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/50 border border-white/60 hover:bg-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer">
                    <span className="material-symbols-outlined text-primary text-xl md:text-2xl group-hover:scale-110 transition-transform">favorite</span>
                </button>
            </nav>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center relative pt-24 md:pt-32 pb-12">

                {/* Hero Image */}
                <div className="relative w-64 h-64 md:w-[380px] md:h-[380px] mb-8 md:mb-10 select-none shrink-0">
                    {/* Heart container */}
                    <div className="w-full h-full hand-drawn-heart bg-gradient-to-br from-primary to-destructive shadow-2xl relative transform transition-transform duration-700 hover:scale-[1.02]">
                        <img
                            alt="Couple in love"
                            className="w-full h-full object-cover opacity-90 mix-blend-overlay"
                            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-overlay"></div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute -top-6 -right-6 animate-float">
                        <span className="material-symbols-outlined text-3xl md:text-4xl text-[#ffb6c1] drop-shadow-sm">auto_awesome</span>
                    </div>
                    <div className="absolute top-1/4 -right-10 animate-float-delayed">
                        <span className="material-symbols-outlined text-xl md:text-2xl text-[#ffcce0] drop-shadow-sm">star</span>
                    </div>
                    <div className="absolute bottom-6 -left-8 animate-float-delayed">
                        <span className="material-symbols-outlined text-2xl md:text-3xl text-[#ffb6c1] drop-shadow-sm">favorite</span>
                    </div>
                </div>

                {/* Typography */}
                <div className="max-w-3xl mx-auto space-y-5 z-10 shrink-0">
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-foreground">
                        <span className="italic block mb-0.5">Your love story,</span>
                        <span className="italic text-primary">cinematically</span> <span className="italic">told.</span>
                    </h1>

                    <p className="text-base md:text-lg text-foreground/80 font-light leading-relaxed max-w-lg mx-auto mt-4 px-4">
                        Create a private, beautiful digital keepsake for your partner in seconds. No apps, just heart.
                    </p>

                    {/* CTA Section */}
                    <div className="pt-8 flex flex-col items-center gap-4">
                        <button
                            onClick={() => navigate("/create")}
                            className="bg-primary hover:bg-[#be123c] text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-sm cursor-pointer"
                        >
                            Create your Wrapped
                        </button>

                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-foreground/60 font-medium">
                            <span className="material-symbols-outlined text-sm md:text-base">lock</span>
                            Private • No Account Required
                        </div>
                    </div>
                </div>
            </main>



            {/* Font variation settings for symbols */}
            <style>{`
                .material-symbols-outlined {
                  font-variation-settings:
                  'FILL' 1,
                  'wght' 400,
                  'GRAD' 0,
                  'opsz' 24
                }
            `}</style>
        </div>
    )
}
