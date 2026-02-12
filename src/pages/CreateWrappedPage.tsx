import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Switch } from "../components/ui/switch"
import { useToast } from "../hooks/use-toast"
import { useEditorStore } from "../lib/store"
import { FullScreenLoader } from "../components/ui/FullScreenLoader"

export function CreateWrappedPage() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const { createWrapped, drafts, deleteDraft } = useEditorStore()

    const [loading, setLoading] = useState(false)
    const [view, setView] = useState<'list' | 'create'>(drafts.length > 0 ? 'list' : 'create')

    // Form State
    const [formData, setFormData] = useState({
        partnerName: "",
        isPasswordProtected: false,
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isPasswordProtected: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.partnerName.trim()) {
            toast({
                variant: "destructive",
                title: "Name required",
                description: "Please enter your partner's name.",
            })
            return
        }

        if (formData.isPasswordProtected && formData.password.length < 4) {
            toast({
                variant: "destructive",
                title: "Password too short",
                description: "Password must be at least 4 characters.",
            })
            return
        }

        setLoading(true)

        try {
            const slug = await createWrapped({
                title: `For ${formData.partnerName}`,
                partnerName: formData.partnerName,
                isPasswordProtected: formData.isPasswordProtected,
                passwordHash: formData.password
            })

            toast({
                title: "Draft created!",
                description: "Start editing your wrapped.",
            })

            navigate(`/editor/${slug}`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to create",
                description: "Something went wrong. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (e: React.MouseEvent, slug: string) => {
        e.stopPropagation()
        if (window.confirm("Are you sure you want to delete this draft?")) {
            deleteDraft(slug)
            if (drafts.length <= 1) setView('create') // Auto switch if last one deleted (check length before delete updates? sync issue? store updates trigger re-render)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-soft-pink p-4 relative overflow-hidden font-sans text-text-main">

            {/* Full-screen loading overlay */}
            <FullScreenLoader show={loading} message="Creating your love story..." />

            {/* Floating Hearts Background */}
            <div className="absolute top-10 left-10 animate-float opacity-40 pointer-events-none">
                <span className="material-symbols-outlined text-6xl text-[#ffb6c1]">favorite</span>
            </div>
            <div className="absolute top-20 left-24 animate-float-delayed opacity-30 pointer-events-none">
                <span className="material-symbols-outlined text-4xl text-[#ffcce0]">favorite</span>
            </div>
            <div className="absolute bottom-10 right-10 animate-float-delayed opacity-40 pointer-events-none">
                <span className="material-symbols-outlined text-8xl text-[#ffb6c1]">favorite</span>
            </div>

            <div className="z-10 w-full max-w-md space-y-8 text-center animate-fade-in-up">

                {view === 'list' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-text-main">
                                Your Wrapped Stories
                            </h1>
                            <p className="text-text-main/60">
                                Resume editing or start a new one.
                            </p>
                        </div>

                        <div className="grid gap-4 max-h-[50vh] overflow-y-auto px-2 py-2 custom-scrollbar">
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    onClick={() => navigate(`/editor/${draft.slug}`)}
                                    className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/20 group text-left relative"
                                >
                                    <h3 className="font-bold text-lg text-text-main truncate pr-8">{draft.title || "Untitled Wrapped"}</h3>
                                    <p className="text-sm text-text-main/50">For {draft.partnerName || "someone special"}</p>
                                    <p className="text-xs text-text-main/30 mt-2">
                                        Last edited: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : new Date(draft.createdAt).toLocaleDateString()}
                                    </p>

                                    <button
                                        onClick={(e) => handleDelete(e, draft.slug)}
                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Draft"
                                    >
                                        <span className="material-icons-round text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setView('create')}
                            className="w-full rounded-full bg-primary hover:bg-deep-red text-white py-6 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                        >
                            Create New Wrapped
                        </Button>
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-text-main/40 hover:text-primary transition-colors font-medium mt-4 block mx-auto"
                        >
                            Back to home
                        </button>
                    </div>
                )}

                {view === 'create' && (
                    <>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-main">
                                For someone special
                            </h1>
                            <p className="text-text-main/60">
                                Create a cinematic keepsake for your partner.
                            </p>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6 text-left">

                                <div className="space-y-2">
                                    <label htmlFor="partnerName" className="text-sm font-semibold text-text-main/80 block">
                                        Partner's Name
                                    </label>
                                    <Input
                                        id="partnerName"
                                        name="partnerName"
                                        placeholder="Enter their name..."
                                        value={formData.partnerName}
                                        onChange={handleChange}
                                        className="bg-gray-50 border-gray-100 rounded-xl px-4 py-6 text-base focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <label htmlFor="isPasswordProtected" className="text-sm font-semibold text-text-main/80 cursor-pointer select-none">
                                        Add a password
                                    </label>
                                    <Switch
                                        id="isPasswordProtected"
                                        checked={formData.isPasswordProtected}
                                        onCheckedChange={handleSwitchChange}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>

                                {formData.isPasswordProtected && (
                                    <div className="animate-accordion-down overflow-hidden pt-2">
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="bg-gray-50 border-gray-100 rounded-xl px-4 py-6 text-base focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-gray-400"
                                            required={formData.isPasswordProtected}
                                        />
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full rounded-full bg-primary hover:bg-deep-red text-white py-6 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons-round text-lg animate-spin">refresh</span>
                                                Creating...
                                            </div>
                                        ) : (
                                            "Start"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="pt-4 flex flex-col gap-2">
                            {drafts.length > 0 && (
                                <button
                                    onClick={() => setView('list')}
                                    className="text-sm text-primary font-bold hover:underline mb-2"
                                >
                                    View my drafts ({drafts.length})
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/")}
                                className="text-sm text-text-main/40 hover:text-primary transition-colors font-medium"
                            >
                                Back to home
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .material-symbols-outlined {
                  font-variation-settings:
                  'FILL' 1,
                  'wght' 400,
                  'GRAD' 0,
                  'opsz' 24
                }
                /* Fade in up animation */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    )
}
