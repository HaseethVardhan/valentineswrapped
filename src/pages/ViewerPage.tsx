import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Heart, Lock } from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

import { ViewerLayout } from "../components/layout/ViewerLayout"
import { StoryViewer } from "../components/viewer/StoryViewer"
import type { Wrapped } from "../types"
import { api } from "../lib/api"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { useEditorStore } from "../lib/store"
import { IntroSequence } from "../components/viewer/IntroSequence"
import { BackgroundEffects } from "../components/viewer/BackgroundEffects"
import { ClickSparkles } from "../components/viewer/ClickSparkles"

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function ViewerPage() {
    const { slug } = useParams()
    const [wrapped, setWrapped] = useState<Wrapped | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true) // Initial loading true
    const [unlocking, setUnlocking] = useState(false)
    const [started, setStarted] = useState(false)
    const [showIntro, setShowIntro] = useState(false)

    // Video State
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [videoPlayer, setVideoPlayer] = useState<any>(null)

    // Get potential local draft
    const localWrapped = useEditorStore(state => state.wrapped)

    // Load YouTube API
    useEffect(() => {
        if (!wrapped?.bgMusicUrl) return

        const initPlayer = () => {
            // Updated regex to handle ?si= and other params
            const videoId = wrapped.bgMusicUrl?.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&?]+)/)?.[1]
            if (!videoId) return

            if (!videoId) return

            // Ensure element exists before initializing
            if (!document.getElementById('bg-music-player')) {
                console.error("Player element not found")
                return
            }

            try {
                new window.YT.Player('bg-music-player', {
                    height: '1',
                    width: '1',
                    videoId: videoId,
                    playerVars: {
                        'playsinline': 1,
                        'controls': 0,
                        'loop': 1,
                        'playlist': videoId, // Required for loop to work
                        'autoplay': 0, // We handle autoplay manually
                        'start': wrapped.bgMusicStartTime || 0,
                        'disablekb': 1,
                        'fs': 0,
                        'modestbranding': 1
                    },
                    events: {
                        'onReady': (event: any) => {
                            setVideoPlayer(event.target)
                            event.target.setVolume(50) // Set reasonable starting volume
                        },
                        'onError': (e: any) => console.error("YouTube Player Error:", e)
                    }
                })
            } catch (error) {
                console.error("Error creating YouTube player:", error)
            }
        }

        if (!window.YT) {

            const tag = document.createElement('script')
            tag.src = "https://www.youtube.com/iframe_api"
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
            window.onYouTubeIframeAPIReady = initPlayer
        } else {
            initPlayer()
        }
    }, [wrapped?.bgMusicUrl, loading]) // Add loading dependency to retry when DOM is ready

    useEffect(() => {
        const load = async () => {
            console.log("ViewerPage: Loading slug:", slug)
            if (!slug) return

            // 1. Check if we have a local draft matching this slug (for preview)
            if (localWrapped && localWrapped.slug === slug) {
                setWrapped(localWrapped)
                setLoading(false)
                // Set showIntro true initially, but we might verify password first
                setShowIntro(true)
                return
            }

            // 2. Otherwise fetch from API (public view)
            try {
                const data = await api.getWrapped(slug)
                setWrapped(data)
                setShowIntro(true)
            } catch (e) {
                console.error("Failed to load wrapped", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [slug, localWrapped])

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault()
        setUnlocking(true)
        setError(false)

        // Simple check against stored hash (which is raw password for now)
        setTimeout(() => {
            if (wrapped && password === wrapped.passwordHash) {
                setIsAuthenticated(true)
                // Intro is already set to true, so it will show now
            } else {
                setError(true)
            }
            setUnlocking(false)
        }, 1000)
    }

    // Toggle Play/Pause
    const togglePlay = () => {
        if (!videoPlayer) return
        if (isPlaying) {
            videoPlayer.pauseVideo()
        } else {
            videoPlayer.playVideo()
        }
        setIsPlaying(!isPlaying)
    }

    // Toggle Mute
    const toggleMute = () => {
        if (!videoPlayer) return
        if (isMuted) {
            videoPlayer.unMute()
        } else {
            videoPlayer.mute()
        }
        setIsMuted(!isMuted)
    }

    const handleStart = () => {

        setStarted(true)
        if (videoPlayer && typeof videoPlayer.playVideo === 'function') {
            videoPlayer.playVideo()
            videoPlayer.unMute() // Ensure it's not muted by default
            setIsPlaying(true)
        } else {
            console.warn("Player not ready on start")
        }
    }

    // Content Rendering Logic
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex h-screen items-center justify-center bg-[#fff0f3] z-20 relative">
                    <LoadingSpinner size="lg" text="Wrapping your story..." />
                </div>
            )
        }

        if (!wrapped) {
            return <div className="flex h-screen items-center justify-center text-primary z-20 relative">Wrapped not found</div>
        }

        if (wrapped.isPasswordProtected && !isAuthenticated) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center p-4 relative z-10 font-sans text-text-main">
                    {/* Floating Hearts Background - Only for Password Screen */}
                    <div className="absolute top-10 left-10 animate-float opacity-40 pointer-events-none">
                        <span className="material-symbols-outlined text-6xl text-[#ffb6c1]">favorite</span>
                    </div>
                    <div className="absolute top-20 left-24 animate-float-delayed opacity-30 pointer-events-none">
                        <span className="material-symbols-outlined text-4xl text-[#ffcce0]">favorite</span>
                    </div>
                    <div className="absolute bottom-10 right-10 animate-float-delayed opacity-40 pointer-events-none">
                        <span className="material-symbols-outlined text-8xl text-[#ffb6c1]">favorite</span>
                    </div>
                    <div className="absolute bottom-32 right-32 animate-float opacity-30 pointer-events-none">
                        <span className="material-symbols-outlined text-5xl text-[#ffcce0]">favorite</span>
                    </div>

                    <div className="z-10 w-full max-w-sm text-center animate-fade-in-up space-y-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <Heart className="w-20 h-20 text-primary animate-pulse fill-primary/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-main font-serif">
                                A Secret for You
                            </h1>
                            <p className="text-text-main/60 italic">
                                "This memory is locked with love..."
                            </p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-6">
                            <div className="space-y-4">
                                <Input
                                    type="password"
                                    placeholder="Enter the secret word..."
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        setError(false)
                                    }}
                                    className={`text-center text-lg tracking-widest border-2 rounded-full py-6 bg-white/80 backdrop-blur transition-all
                                        ${error
                                            ? "border-destructive focus-visible:ring-destructive animate-shake"
                                            : "border-pink-200 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                                        }`}
                                />
                                {error && (
                                    <p className="text-sm text-destructive font-medium animate-fade-in">
                                        That's not the secret word... try again?
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full rounded-full bg-primary hover:bg-deep-red text-white py-6 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                                disabled={unlocking}
                            >
                                {unlocking ? (
                                    <span className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 animate-spin" /> Unlocking...
                                    </span>
                                ) : (
                                    "Unlock My Heart"
                                )}
                            </Button>
                        </form>
                    </div>

                    <style>{`
                        .material-symbols-outlined {
                        font-variation-settings:
                        'FILL' 1,
                        'wght' 400,
                        'GRAD' 0,
                        'opsz' 24
                        }
                        @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            25% { transform: translateX(-5px); }
                            75% { transform: translateX(5px); }
                        }
                        .animate-shake {
                            animation: shake 0.4s ease-in-out;
                        }
                    `}</style>
                </div>
            )
        }

        return (
            <>
                {showIntro ? (
                    <div className="relative z-50">
                        <IntroSequence onComplete={() => {
                            setShowIntro(false)
                            setStarted(true)
                            // Auto-play music if possible? 
                            if (videoPlayer) {
                                videoPlayer.playVideo()
                                videoPlayer.unMute()
                                setIsPlaying(true)
                            }
                        }} />
                    </div>
                ) : (
                    <div className="relative z-10 h-full">
                        <ViewerLayout>
                            {!started ? (
                                <div
                                    className="flex flex-col items-center justify-center h-full cursor-pointer z-10 relative bg-soft-pink text-text-main"
                                    onClick={handleStart}
                                >
                                    <div className="absolute top-10 left-10 animate-float opacity-40 pointer-events-none">
                                        <span className="material-symbols-outlined text-6xl text-[#ffb6c1]">favorite</span>
                                    </div>
                                    <div className="absolute bottom-10 right-10 animate-float-delayed opacity-40 pointer-events-none">
                                        <span className="material-symbols-outlined text-8xl text-[#ffb6c1]">favorite</span>
                                    </div>

                                    <Heart className="h-20 w-20 text-primary animate-pulse mb-8 fill-primary/20" />
                                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center font-serif text-[#8b1a1a]">{wrapped.title || "Our Story"}</h1>
                                    <p className="text-xl opacity-80 animate-bounce font-light tracking-widest mt-4">Tap to begin</p>
                                </div>
                            ) : (
                                <>
                                    <StoryViewer wrapped={wrapped} />

                                    {/* Music Controls */}
                                    {wrapped.bgMusicUrl && (
                                        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20">
                                            <button
                                                onClick={toggleMute}
                                                className="p-1.5 rounded-full hover:bg-white/20 text-[var(--color-neutral-900)] transition-colors"
                                            >
                                                {isMuted ? <span className="material-icons-round text-sm">volume_off</span> : <span className="material-icons-round text-sm">volume_up</span>}
                                            </button>
                                            <button
                                                onClick={togglePlay}
                                                className="p-1.5 rounded-full hover:bg-white/20 text-[var(--color-neutral-900)] transition-colors"
                                            >
                                                {isPlaying ? <span className="material-icons-round text-sm">pause</span> : <span className="material-icons-round text-sm">play_arrow</span>}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </ViewerLayout>
                    </div>
                )}

                {/* Music Controls (Only show when not in intro and not started) */}
                {!showIntro && !started && (
                    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 opacity-0">
                        {/* Hidden on start screen */}
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="relative h-screen w-full bg-[#FFF5F7] overflow-hidden">
            <BackgroundEffects />
            <ClickSparkles />

            {/* Hidden Player Container - Always present to keep music playing */}
            {/* Must be persistent across all states to prevent unmounting/remounting issues with YouTube API */}
            <div id="bg-music-player" className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none -z-50" />

            {renderContent()}
        </div>
    )
}
