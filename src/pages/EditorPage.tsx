import { useRef } from "react"
import { ShareDialog } from "../components/ShareDialog"
import { useState } from "react"
import { useEditorStore } from "../lib/store"
import { useNavigate, useParams } from "react-router-dom"
import type { Page, ScrapbookPage, CouponPage, SummaryPage } from "../types"
import { migrateScrapbookContent } from "../lib/transformers"
import { useEffect } from "react"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { FullScreenLoader } from "../components/ui/FullScreenLoader"
import { PagesSidebar } from "../components/editor/PagesSidebar"
import { EditSidebar } from "../components/editor/EditSidebar"
import { MobileNav, type EditorTab } from "../components/editor/MobileNav"

export function EditorPage() {
    const navigate = useNavigate()
    const { slug } = useParams()

    // Warn on back/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [mobileTab, setMobileTab] = useState<EditorTab>('preview')

    const {
        wrapped,
        activePageId,
        isSaving,
        updateWrappedTitle,
        updateWrapped,
        addPage,
        updatePage,
        removePage,
        reorderPages,
        setActivePage,
        save,
        loadWrapped
    } = useEditorStore()

    // Ref to track if we are in the middle of a save operation that changes the slug
    // This prevents the "slug mismatch" effect from triggering a reload/redirect
    const isHandlingSave = useRef(false)

    // Sync URL slug with store
    useEffect(() => {
        if (!slug) return

        // If we are handling a save, skip this check
        if (isHandlingSave.current) {
            // If slugs match now, we can turn off the flag
            if (wrapped && wrapped.slug === slug) {
                isHandlingSave.current = false
            }
            return
        }

        // If we have data but slugs don't match, reload
        if (wrapped && wrapped.slug !== slug) {
            loadWrapped(slug).catch(() => {
                navigate('/')
            })
        }

        // If we have no data, load it
        if (!wrapped) {
            loadWrapped(slug).catch(() => {
                navigate('/')
            })
        }
    }, [slug, wrapped, loadWrapped, navigate])

    const activePage = wrapped?.pages.find((p: Page) => p.id === activePageId)

    // Helper to format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "August 14, 2023" // Default/Placeholder
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "August 14, 2023"
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

    // Helper to check if page is scrapbook (for TS)
    const isScrapbook = (page: Page): page is ScrapbookPage => page.type === 'scrapbook'
    const isCoupon = (page: Page): page is CouponPage => page.type === 'coupon'
    const isSummary = (page: Page): page is SummaryPage => page.type === 'summary'

    const handleSave = async () => {

        // Flag that we are handling a save that might change the URL
        isHandlingSave.current = true

        try {
            const newSlug = await save()

            if (newSlug) {
                // If slug changed (e.g. from draft to real), update URL
                if (slug !== newSlug) {
                    navigate(`/editor/${newSlug}`, { replace: true })
                }
                setShareDialogOpen(true)
            }
        } catch {
            isHandlingSave.current = false
        }
        // Note: isHandlingSave.current is reset in the useEffect once the new slug matches
    }

    // Auto-migrate content
    useEffect(() => {
        if (activePage && isScrapbook(activePage) && !activePage.content.blocks) {
            const blocks = migrateScrapbookContent(activePage)
            updatePage(activePage.id, {
                content: {
                    ...activePage.content,
                    blocks,
                    // Clear old fields to avoid double migration if we revisit
                    text: undefined,
                    images: []
                }
            })
        }
    }, [activePage, isScrapbook])

    // ... existing formatDate ...

    if (!wrapped) return (
        <div className="flex h-screen items-center justify-center bg-[var(--color-background-light)]">
            <LoadingSpinner size="lg" text="Loading editor..." />
        </div>
    )

    // ... existing type guards ...

    return (
        <div className="bg-[var(--color-background-light)] text-[var(--color-neutral-900)] font-sans h-screen flex flex-col overflow-hidden">

            <ShareDialog
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                slug={wrapped.slug}
            />

            {/* Full-screen loading overlays */}
            <FullScreenLoader show={isSaving} message="Saving your love story..." />
            <FullScreenLoader show={uploadingImage} message="Uploading image..." />

            {/* Header */}
            <header className="w-full h-16 md:h-20 bg-transparent flex items-center justify-between px-4 md:px-8 z-50 shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to leave? content won't be saved if not saved.")) {
                                navigate("/")
                            }
                        }}
                        className="p-2 md:p-3 rounded-full bg-white/50 hover:bg-white shadow-sm transition-all text-[var(--color-editor-primary-dark)]"
                    >
                        <span className="material-icons-round text-lg md:text-xl">arrow_back</span>
                    </button>
                    <div className="flex flex-col hidden md:flex">
                        <span className="text-xs font-bold text-[var(--color-editor-primary-dark)] uppercase tracking-widest mb-0.5">My Love</span>
                        <div className="group flex items-center gap-2 cursor-pointer">
                            <input
                                className="bg-transparent border-none p-0 text-xl font-bold text-[var(--color-neutral-800)] focus:ring-0 focus:outline-none w-56 placeholder-[var(--color-neutral-400)]/70"
                                type="text"
                                value={wrapped.title}
                                onChange={(e) => updateWrappedTitle(e.target.value)}
                            />
                            <span className="material-icons-round text-sm text-[var(--color-editor-primary-dark)]/50 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-center w-1/3">
                    <div className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--color-editor-primary)]"></span>
                        <span className="text-[10px] md:text-xs font-semibold text-[var(--color-neutral-600)] uppercase tracking-wide whitespace-nowrap">Auto-saved</span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
                    <button
                        onClick={() => navigate(`/preview/${wrapped.slug}`)}
                        className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-full bg-white/50 hover:bg-white transition-all text-[var(--color-neutral-700)] font-medium text-sm md:text-base"
                    >
                        <span className="material-icons-round text-lg md:text-xl text-[var(--color-editor-primary-dark)]">visibility</span>
                        <span className="hidden lg:inline">Preview</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-[var(--color-editor-primary)] to-[var(--color-editor-primary-dark)] hover:shadow-lg hover:shadow-[var(--color-editor-primary)]/30 text-white px-4 py-2 md:px-7 md:py-2.5 rounded-full font-bold transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        {isSaving ? (
                            <>
                                <span className="material-icons-round text-base md:text-lg animate-spin">refresh</span>
                                <span className="hidden md:inline">Saving...</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden md:inline">Share Love</span>
                                <span className="md:hidden">Share</span>
                                <span className="material-icons-round text-base md:text-lg">favorite</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden relative mx-0 md:mx-6 mb-0 md:mb-6 rounded-none md:rounded-3xl bg-white shadow-none md:shadow-[var(--shadow-soft)] ring-0 md:ring-1 md:ring-white/60">

                {/* Left Sidebar - Pages */}
                <PagesSidebar
                    wrapped={wrapped}
                    activePageId={activePageId}
                    setActivePage={(id) => {
                        setActivePage(id)
                        // On mobile, switch to preview after selection
                        if (window.innerWidth < 768) {
                            setMobileTab('preview')
                        }
                    }}
                    addPage={addPage}
                    removePage={removePage}
                    reorderPages={reorderPages}
                    updateWrapped={updateWrapped}
                    className={`${mobileTab === 'pages' ? 'flex' : 'hidden'} md:flex md:w-72 md:rounded-l-3xl border-r border-[var(--color-neutral-100)]`}
                />

                {/* Center - Device Preview */}
                <section className={`flex-1 floral-pattern relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden md:rounded-r-3xl xl:rounded-r-none ${mobileTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
                    {/* Background Blurs */}
                    <div className="absolute top-10 right-10 w-64 h-64 bg-[var(--color-editor-primary)]/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
                    <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--color-editor-secondary)]/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>

                    {/* Device Frame */}
                    {/* Device Frame */}
                    <div className="relative w-full max-w-full md:max-w-[340px] h-full max-h-[calc(100vh-140px)] md:h-auto md:max-h-[85vh] aspect-[9/16] bg-white device-frame overflow-hidden flex flex-col shrink-0 transition-transform duration-500 ease-out hover:scale-[1.01] z-20 shadow-2xl md:shadow-none my-auto md:mb-0 mx-auto">
                        {/* Status Bar */}
                        <div className="h-10 w-full flex justify-between items-center px-6 pt-3 select-none text-[10px] font-bold text-[var(--color-neutral-800)] z-20 absolute top-0 left-0 right-0 bg-gradient-to-b from-white/80 to-transparent">
                            <span>9:41</span>
                            <div className="flex gap-1.5 opacity-60">
                                <span className="material-icons-round text-[14px]">signal_cellular_alt</span>
                                <span className="material-icons-round text-[14px]">wifi</span>
                                <span className="material-icons-round text-[14px]">battery_full</span>
                            </div>
                        </div>

                        {/* Page Content Render inside Phone */}
                        <div className="flex-1 relative w-full h-full bg-[#FFF5F7] overflow-y-auto no-scrollbar pt-12 pb-6">
                            {activePage ? (
                                <div className="px-6 flex flex-col gap-6 min-h-full">

                                    {/* SCRAPBOOK PREVIEW */}
                                    {isScrapbook(activePage) && (
                                        <div className="relative min-h-[500px] flex flex-col p-4">
                                            {/* Render Title if exists */}
                                            {activePage.content.title && (
                                                <div className="text-center mb-6 z-10">
                                                    <h2 className="text-2xl font-bold text-[var(--color-neutral-800)] font-handwriting transform -rotate-2">
                                                        {activePage.content.title}
                                                    </h2>
                                                    <div className="text-xs text-[var(--color-neutral-500)] font-medium uppercase tracking-widest mt-1">
                                                        {formatDate(activePage.content.date)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Render Blocks */}
                                            <div className="relative flex-1">
                                                {(activePage.content.blocks || []).map((block, index) => (
                                                    <div
                                                        key={block.id}
                                                        style={{
                                                            transform: `rotate(${block.rotation || 0}deg)`,
                                                            zIndex: block.zIndex || index
                                                        }}
                                                        className={`transition-all duration-300 ${block.type === 'text' ? 'mb-4' : 'mb-8'}`}
                                                    >
                                                        {block.type === 'image' && (
                                                            <div className="bg-white p-3 pb-8 shadow-md transform hover:scale-[1.02] transition-transform w-full max-w-[280px] mx-auto rotate-1 border border-gray-100">
                                                                <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-2">
                                                                    <img
                                                                        src={block.url}
                                                                        alt="Memory"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="text-center font-handwriting text-gray-600 text-lg leading-none pt-2">
                                                                    {block.caption}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {block.type === 'text' && (
                                                            <div className={`p-6 shadow-sm transform hover:scale-[1.02] transition-transform max-w-[90%] mx-auto relative group
                                                                ${(block.variant || 'sticky') === 'sticky' ? 'bg-[#fff9c4]/90 rotate-[-1deg] font-handwriting text-xl' : ''}
                                                                ${block.variant === 'paper' ? 'bg-white border border-gray-200 rotate-[1deg] font-serif' : ''}
                                                                ${block.variant === 'card' ? 'bg-[#fafafa] border-[4px] border-double border-[var(--color-editor-primary)]/20 rotate-0 font-sans' : ''}
                                                                ${block.variant === 'transparent' ? 'bg-transparent text-shadow-sm rotate-0 font-handwriting text-2xl font-bold text-[var(--color-editor-primary)]' : ''}
                                                            `}>
                                                                {/* Variant specific decorations */}
                                                                {(block.variant === 'paper') && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 backdrop-blur-sm transform -rotate-1 border border-white/60 shadow-sm"></div>}

                                                                <p className={`text-gray-800 leading-relaxed whitespace-pre-wrap ${(block.variant === 'card') ? 'text-center italic' : ''}`}>
                                                                    {block.content}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {(!activePage.content.blocks || activePage.content.blocks.length === 0) && (
                                                    <div className="text-center text-gray-400 italic py-10">
                                                        Add some memories...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* COUPON PREVIEW */}
                                    {isCoupon(activePage) && (
                                        <div className="flex flex-col items-center gap-4 w-full px-4 overflow-y-auto custom-scrollbar h-full py-8 mt-4">
                                            <h2 className="text-3xl font-bold text-[var(--color-editor-primary-dark)] text-center font-handwriting transform -rotate-2 mb-8">Love Coupons</h2>
                                            <p className="text-[var(--color-neutral-600)] text-center text-[10px] font-medium uppercase tracking-widest mb-6">
                                                Redeem wisely...
                                            </p>

                                            {activePage.content.coupons.map((coupon) => (
                                                <div key={coupon.id} className="relative w-full max-w-[280px]">
                                                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border-2 border-[var(--color-neutral-100)] relative group transform hover:scale-[1.02] transition-transform">
                                                        {/* Decorative Perforations */}
                                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-background-light)] border border-[var(--color-neutral-100)]"></div>
                                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-background-light)] border border-[var(--color-neutral-100)]"></div>
                                                        <div className="absolute left-[8px] right-[8px] top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[var(--color-neutral-200)] pointer-events-none"></div>

                                                        <div className="flex flex-col">
                                                            {/* Top Section */}
                                                            <div className="p-4 pb-3 bg-gradient-to-br from-[#fff0f3] to-white flex flex-col items-center text-center relative z-10">
                                                                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--color-editor-primary)] mb-2 border border-[var(--color-editor-primary)]/20">
                                                                    <span className="material-icons-round text-sm">local_activity</span>
                                                                </div>
                                                                <h3 className="text-lg font-bold font-serif text-[var(--color-neutral-800)] leading-tight">
                                                                    {coupon.title || "Coupon Title"}
                                                                </h3>
                                                            </div>

                                                            {/* Bottom Section */}
                                                            <div className="p-4 pt-3 bg-white flex flex-col items-center text-center relative z-10">

                                                                <button className="bg-[var(--color-editor-primary)] text-white px-6 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase shadow-md pointer-events-none opacity-90">
                                                                    Redeem
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {activePage.content.coupons.length === 0 && (
                                                <div className="text-center py-10 text-[var(--color-neutral-400)] italic">
                                                    No coupons added yet.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* SUMMARY PREVIEW */}
                                    {isSummary(activePage) && (
                                        <div className="flex flex-col justify-center min-h-[500px] text-center gap-6">
                                            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm text-[var(--color-editor-primary)] mb-4">
                                                <span className="material-icons-round text-3xl">favorite</span>
                                            </div>
                                            <h2 className="text-3xl font-serif text-[var(--color-neutral-900)] italic">
                                                See you soon...
                                            </h2>
                                            <p className="text-3xl leading-relaxed whitespace-pre-wrap font-handwriting text-[var(--color-neutral-800)]">
                                                {activePage.content.message || "Enter your final message here."}
                                            </p>
                                            <div className="mt-8 text-xs font-bold text-[var(--color-neutral-400)] uppercase tracking-widest">
                                                Made with Love
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-8 flex justify-center pb-4">
                                        <span className="material-icons-round text-[var(--color-editor-primary)]/30 animate-bounce">keyboard_arrow_down</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground p-8 text-center">
                                    No page selected
                                </div>
                            )}
                        </div>
                    </div>


                </section>

                {/* Right Sidebar - Story Content */}
                <EditSidebar
                    activePage={activePage}
                    updatePage={updatePage}
                    uploadingImage={uploadingImage}
                    setUploadingImage={setUploadingImage}
                    className={`${mobileTab === 'edit' ? 'flex' : 'hidden'} xl:flex xl:w-80 xl:rounded-r-3xl border-l border-[var(--color-neutral-100)]`}
                />
            </main>

            <MobileNav activeTab={mobileTab} setActiveTab={setMobileTab} />
        </div>
    )
}
