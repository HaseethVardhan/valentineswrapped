import { useState, useEffect, useRef } from "react"
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
    const [videoPlayer, setVideoPlayer] = useState<any>(null)
    const userInteracted = useRef(false) // Tracks if user has explicitly started playback

    // Get potential local draft
    const localWrapped = useEditorStore(state => state.wrapped)

    // Load YouTube API
    useEffect(() => {
        if (!wrapped?.bgMusicUrl) return

        const initPlayer = () => {
            // Updated regex to handle ?si= and other params
            const videoId = wrapped.bgMusicUrl?.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&?]+)/)?.[1]
            if (!videoId) return

            // Ensure element exists before initializing
            if (!document.getElementById('bg-music-player')) {
                return
            }

            try {
                new window.YT.Player('bg-music-player', {
                    height: '200',
                    width: '200',
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
                        'modestbranding': 1,
                        'origin': window.location.origin
                    },
                    events: {
                        'onReady': (event: any) => {
                            setVideoPlayer(event.target)
                            event.target.setVolume(50)
                            // Start playing muted immediately to preload/buffer the audio
                            // This way it's instant when the user taps to start
                            event.target.mute()
                            event.target.playVideo()
                        },
                        'onStateChange': (event: any) => {
                            // If ended (0), restart playback for continuous loop
                            if (event.data === 0) {
                                event.target.playVideo()
                            }
                        },
                        'onError': () => { }
                    }
                })
            } catch {
                // YouTube player creation failed silently
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
            } catch {
                // Failed to load wrapped
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [slug, localWrapped])

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setUnlocking(true)
        setError(false)

        try {
            // Special case for local drafts (Preview mode)
            // These don't exist in DB yet, so we verify against the local transient password
            if (wrapped?.id.startsWith('temp-')) {
                if (wrapped.password === password) {
                    setIsAuthenticated(true)
                } else {
                    setError(true)
                }
                return
            }

            // For published wrappeds, verify server-side
            const isValid = await api.verifyPassword(slug!, password)
            if (isValid) {
                setIsAuthenticated(true)
            } else {
                setError(true)
            }
        } catch {
            setError(true)
        } finally {
            setUnlocking(false)
        }
    }

    // Keep-alive for mobile audio
    useEffect(() => {
        if (!started || !videoPlayer || typeof videoPlayer.getPlayerState !== 'function') return
        if (!userInteracted.current) return // Only keep-alive after user has explicitly started playback

        const checkAndPlay = () => {
            try {
                const state = videoPlayer.getPlayerState()
                // If it's paused (2), ended (0), cued (5), or unstarted (-1)
                // And the user has started playback, try to resume
                if (state !== 1 && state !== 3) {
                    videoPlayer.playVideo()
                }
            } catch {
                // Error in keep-alive
            }
        }

        const interval = setInterval(checkAndPlay, 1000) // Check every 1 second (faster for mobile)

        const handleInteraction = () => {
            checkAndPlay()
        }

        // Resume audio when the page becomes visible again (after app switch, lock/unlock)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && userInteracted.current) {
                checkAndPlay()
            }
        }

        window.addEventListener('touchstart', handleInteraction)
        window.addEventListener('click', handleInteraction)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(interval)
            window.removeEventListener('touchstart', handleInteraction)
            window.removeEventListener('click', handleInteraction)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [started, videoPlayer])

    const handleStart = () => {
        userInteracted.current = true
        setStarted(true)
        if (videoPlayer && typeof videoPlayer.playVideo === 'function') {
            // Video is already playing muted from preload — just unmute
            videoPlayer.unMute()
            videoPlayer.playVideo() // Ensure it's playing in case preload was blocked
        } else {
            // Player not ready on start
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
                            userInteracted.current = true // Mark user gesture
                            setShowIntro(false)
                            setStarted(true)
                            // Play music — called synchronously inside the user's tap handler chain
                            if (videoPlayer && typeof videoPlayer.playVideo === 'function') {
                                videoPlayer.playVideo()
                                videoPlayer.unMute()
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
            <div id="bg-music-player" className="fixed pointer-events-none" style={{ left: '-9999px', top: '-9999px', width: '200px', height: '200px' }} />

            {renderContent()}
        </div>
    )
}
