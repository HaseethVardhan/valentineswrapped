
import type { Page, Wrapped, ScrapbookPage, CouponPage, SummaryPage } from "../../types"

interface PagesSidebarProps {
    wrapped: Wrapped
    activePageId: string | null
    setActivePage: (id: string) => void
    addPage: (type: 'scrapbook' | 'coupon' | 'summary') => void
    removePage: (id: string) => void
    reorderPages: (id: string, targetId: string) => void
    updateWrapped: (data: Partial<Wrapped>) => void
    className?: string
}

export function PagesSidebar({
    wrapped,
    activePageId,
    setActivePage,
    addPage,
    removePage,
    reorderPages,
    updateWrapped,
    className = ""
}: PagesSidebarProps) {

    const isScrapbook = (page: Page): page is ScrapbookPage => page.type === 'scrapbook'
    const isCoupon = (page: Page): page is CouponPage => page.type === 'coupon'
    const isSummary = (page: Page): page is SummaryPage => page.type === 'summary'

    return (
        <aside className={`w-full h-full bg-white flex flex-col z-10 border-r border-[var(--color-neutral-100)] ${className}`}>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
                <div className="mb-8 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-neutral-600)] uppercase tracking-wider">
                            Partner's Name
                        </label>
                        <input
                            type="text"
                            value={wrapped.partnerName || ""}
                            onChange={(e) => updateWrapped({ partnerName: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[var(--color-neutral-200)] focus:border-[var(--color-editor-primary)] outline-none text-sm"
                            placeholder="Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--color-neutral-600)] uppercase tracking-wider flex items-center gap-2">
                            <span className="material-icons-round text-sm">music_note</span>
                            Background Song
                        </label>
                        <input
                            type="text"
                            value={wrapped.bgMusicUrl || ""}
                            onChange={(e) => updateWrapped({ bgMusicUrl: e.target.value })}
                            className="w-full p-2 rounded-lg border border-[var(--color-neutral-200)] focus:border-[var(--color-editor-primary)] outline-none text-sm"
                            placeholder="YouTube Video URL"
                        />
                        <p className="text-[10px] text-[var(--color-neutral-400)]">
                            Paste a YouTube link. It will auto-play form start.
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                            <label className="text-xs font-bold text-[var(--color-neutral-600)] uppercase tracking-wider whitespace-nowrap">
                                Start at (sec):
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={wrapped.bgMusicStartTime || 0}
                                onChange={(e) => updateWrapped({ bgMusicStartTime: parseInt(e.target.value) || 0 })}
                                className="w-20 p-2 rounded-lg border border-[var(--color-neutral-200)] focus:border-[var(--color-editor-primary)] outline-none text-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[var(--color-neutral-800)] tracking-tight">Pages</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => addPage("scrapbook")}
                            className="w-8 h-8 flex items-center justify-center text-[var(--color-editor-primary-dark)] bg-[var(--color-editor-primary)]/10 hover:bg-[var(--color-editor-primary)]/20 rounded-full transition-colors"
                            title="Add Scrapbook Page"
                        >
                            <span className="material-icons-round text-xl">post_add</span>
                        </button>
                        <button
                            onClick={() => addPage("coupon")}
                            className="w-8 h-8 flex items-center justify-center text-[var(--color-editor-primary-dark)] bg-[var(--color-editor-primary)]/10 hover:bg-[var(--color-editor-primary)]/20 rounded-full transition-colors"
                            title="Add Coupon Page"
                        >
                            <span className="material-icons-round text-xl">local_activity</span>
                        </button>
                        <button
                            onClick={() => addPage("summary")}
                            className="w-8 h-8 flex items-center justify-center text-[var(--color-editor-primary-dark)] bg-[var(--color-editor-primary)]/10 hover:bg-[var(--color-editor-primary)]/20 rounded-full transition-colors"
                            title="Add Summary Page"
                        >
                            <span className="material-icons-round text-xl">notes</span>
                        </button>
                    </div>
                </div>
                <div className="space-y-3 pb-20 md:pb-0">
                    {wrapped.pages.map((page, index) => (
                        <div
                            key={page.id}
                            onClick={() => setActivePage(page.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group relative pr-12 ${activePageId === page.id
                                ? "bg-white border-[var(--color-editor-primary)] ring-2 ring-[var(--color-editor-primary)]/10 shadow-sm"
                                : "bg-[var(--color-neutral-50)] border-[var(--color-neutral-100)] hover:border-[var(--color-editor-primary)]/30"
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${activePageId === page.id
                                ? "bg-[var(--color-editor-primary)] text-white shadow-sm"
                                : "bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-400)] group-hover:text-[var(--color-editor-primary)] group-hover:border-[var(--color-editor-primary)]/30"
                                }`}>
                                {index + 1}
                            </div>
                            <div className="flex flex-col overflow-hidden flex-1">
                                <span className={`font-medium truncate ${activePageId === page.id ? "text-[var(--color-neutral-900)] font-bold" : "text-[var(--color-neutral-700)] group-hover:text-[var(--color-neutral-900)]"}`}>
                                    {isScrapbook(page) && (page.content.title || "Untitled Page")}
                                    {isCoupon(page) && "Love Coupons"}
                                    {isSummary(page) && "Final Message"}
                                </span>
                                <span className="text-[10px] text-[var(--color-neutral-400)] uppercase font-bold tracking-wider">
                                    {page.type}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-[var(--color-neutral-100)] ${activePageId === page.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (index > 0) {
                                                reorderPages(page.id, wrapped.pages[index - 1].id)
                                            }
                                        }}
                                        disabled={index === 0}
                                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--color-neutral-100)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-neutral-600)]"
                                        title="Move Up"
                                    >
                                        <span className="material-icons-round text-sm">keyboard_arrow_up</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (index < wrapped.pages.length - 1) {
                                                reorderPages(page.id, wrapped.pages[index + 1].id)
                                            }
                                        }}
                                        disabled={index === wrapped.pages.length - 1}
                                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--color-neutral-100)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-neutral-600)]"
                                        title="Move Down"
                                    >
                                        <span className="material-icons-round text-sm">keyboard_arrow_down</span>
                                    </button>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Are you sure you want to delete this page?')) {
                                            removePage(page.id)
                                        }
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-[var(--color-neutral-400)] hover:text-red-500 transition-colors"
                                    title="Delete Page"
                                >
                                    <span className="material-icons-round text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}
