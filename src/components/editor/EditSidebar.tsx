import React from "react"
import type { Page, ScrapbookPage, CouponPage, SummaryPage, ScrapbookBlock, Coupon } from "../../types"
import { processImage } from "../../lib/imageCompression"
import { useEditorStore } from "../../lib/store"

interface EditSidebarProps {
    activePage: Page | undefined
    updatePage: (id: string, data: Partial<Page>) => void
    uploadingImage: boolean
    setUploadingImage: (loading: boolean) => void
    className?: string
}

export function EditSidebar({
    activePage,
    updatePage,
    uploadingImage,
    setUploadingImage,
    className = ""
}: EditSidebarProps) {

    const isScrapbook = (page: Page): page is ScrapbookPage => page.type === 'scrapbook'
    const isCoupon = (page: Page): page is CouponPage => page.type === 'coupon'
    const isSummary = (page: Page): page is SummaryPage => page.type === 'summary'

    return (
        <aside className={`w-full h-full bg-white flex flex-col z-10 border-l border-[var(--color-neutral-100)] ${className}`}>
            <div className="p-6 border-b border-[var(--color-neutral-100)]">
                <h2 className="font-bold text-lg text-[var(--color-neutral-800)]">Story Content</h2>
                <p className="text-xs text-[var(--color-neutral-500)] mt-1">Edit your memories</p>
            </div>

            {activePage && isScrapbook(activePage) && (
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar space-y-8">
                    {/* Page Meta */}
                    <div>
                        <label className="text-xs font-bold text-[var(--color-neutral-400)] uppercase tracking-widest mb-4 block">Page Details</label>
                        <input
                            className="w-full p-4 rounded-xl bg-[var(--color-neutral-50)] border-transparent focus:border-[var(--color-editor-primary)] focus:bg-white focus:ring-0 text-sm font-bold text-[var(--color-neutral-700)] transition-all outline-none mb-3"
                            value={activePage.content.title || ""}
                            onChange={(e) => updatePage(activePage.id, { content: { ...activePage.content, title: e.target.value } })}
                            placeholder="Page Title (e.g. First Date)"
                        />
                        <input
                            type="date"
                            className="w-full p-4 rounded-xl bg-[var(--color-neutral-50)] border-transparent focus:border-[var(--color-editor-primary)] focus:bg-white focus:ring-0 text-sm font-bold text-[var(--color-neutral-700)] transition-all outline-none"
                            value={activePage.content.date || ""}
                            onChange={(e) => updatePage(activePage.id, { content: { ...activePage.content, date: e.target.value } })}
                        />
                    </div>

                    {/* Blocks Management */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-bold text-[var(--color-neutral-400)] uppercase tracking-widest block">Content Blocks</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const newBlock: ScrapbookBlock = {
                                            id: `text-${Date.now()}`,
                                            type: 'text',
                                            content: "New note...",
                                            rotation: (Math.random() * 6) - 3,
                                            variant: 'sticky',
                                            zIndex: (activePage.content.blocks?.length || 0) + 1
                                        }
                                        const blocks = [...(activePage.content.blocks || []), newBlock]
                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-[var(--color-editor-primary)]/10 text-[var(--color-editor-primary)] rounded-full hover:bg-[var(--color-editor-primary)]/20 transition-colors"
                                    title="Add Text"
                                >
                                    <span className="material-icons-round text-lg">text_fields</span>
                                </button>
                                <button
                                    onClick={() => document.getElementById('add-image-block-input')?.click()}
                                    disabled={uploadingImage}
                                    className="w-8 h-8 flex items-center justify-center bg-[var(--color-editor-primary)]/10 text-[var(--color-editor-primary)] rounded-full hover:bg-[var(--color-editor-primary)]/20 transition-colors disabled:opacity-50"
                                    title="Add Image"
                                >
                                    {uploadingImage ? (
                                        <span className="material-icons-round text-lg animate-spin">refresh</span>
                                    ) : (
                                        <span className="material-icons-round text-lg">add_photo_alternate</span>
                                    )}
                                    <input
                                        id="add-image-block-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                try {
                                                    setUploadingImage(true)

                                                    // Compress and validate image
                                                    const result = await processImage(file)

                                                    // Show compression info if image was compressed
                                                    if (result.wasCompressed) {
                                                        const originalMB = (result.originalSize / 1024 / 1024).toFixed(1)
                                                        const compressedMB = (result.compressedSize / 1024 / 1024).toFixed(1)
                                                        console.log(`Image compressed: ${originalMB}MB → ${compressedMB}MB`)
                                                    }

                                                    // Upload the compressed image
                                                    const url = await useEditorStore.getState().uploadMedia(result.file)
                                                    const newBlock: ScrapbookBlock = {
                                                        id: `img-${Date.now()}`,
                                                        type: 'image',
                                                        url: url,
                                                        caption: "",
                                                        rotation: (Math.random() * 10) - 5,
                                                        zIndex: (activePage.content.blocks?.length || 0) + 1
                                                    }
                                                    const blocks = [...(activePage.content.blocks || []), newBlock]
                                                    updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                } catch (error) {
                                                    const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
                                                    alert(errorMessage)
                                                } finally {
                                                    setUploadingImage(false)
                                                }
                                            }
                                            e.target.value = ''
                                        }}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(activePage.content.blocks || []).map((block, index) => (
                                <div key={block.id} className="bg-[var(--color-neutral-50)] rounded-xl border border-[var(--color-neutral-100)] overflow-hidden group">
                                    {/* Block Header */}
                                    <div className="bg-[var(--color-neutral-100)] px-3 py-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-round text-[var(--color-neutral-500)] text-sm">
                                                {block.type === 'text' ? 'text_fields' : 'image'}
                                            </span>
                                            <span className="text-xs font-bold text-[var(--color-neutral-600)] uppercase">
                                                {block.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    const blocks = [...(activePage.content.blocks || [])]
                                                    if (index > 0) {
                                                        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]]
                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                    }
                                                }}
                                                disabled={index === 0}
                                                className="w-6 h-6 flex items-center justify-center text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] disabled:opacity-30"
                                            >
                                                <span className="material-icons-round text-base">arrow_upward</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const blocks = [...(activePage.content.blocks || [])]
                                                    if (index < blocks.length - 1) {
                                                        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]
                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                    }
                                                }}
                                                disabled={index === ((activePage.content.blocks || []).length - 1)}
                                                className="w-6 h-6 flex items-center justify-center text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] disabled:opacity-30"
                                            >
                                                <span className="material-icons-round text-base">arrow_downward</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this block?')) {
                                                        const blocks = (activePage.content.blocks || []).filter(b => b.id !== block.id)
                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                    }
                                                }}
                                                className="w-6 h-6 flex items-center justify-center text-[var(--color-neutral-400)] hover:text-red-500 ml-1"
                                            >
                                                <span className="material-icons-round text-base">close</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Block Content Inputs */}
                                    <div className="p-3">
                                        {block.type === 'text' && (
                                            <>
                                                <textarea
                                                    className="w-full p-2 bg-white rounded-lg border border-[var(--color-neutral-200)] focus:border-[var(--color-editor-primary)] focus:outline-none text-sm resize-none"
                                                    rows={3}
                                                    value={block.content || ""}
                                                    onChange={(e) => {
                                                        const blocks = [...(activePage.content.blocks || [])]
                                                        blocks[index] = { ...blocks[index], content: e.target.value }
                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                    }}
                                                    placeholder="Write something..."
                                                />
                                                <div className="mt-2 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                    {(['sticky', 'card', 'paper', 'transparent'] as const).map(variant => (
                                                        <button
                                                            key={variant}
                                                            onClick={() => {
                                                                const blocks = [...(activePage.content.blocks || [])]
                                                                blocks[index] = { ...blocks[index], variant }
                                                                updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                            }}
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0 ${(block.variant || 'sticky') === variant
                                                                ? 'bg-[var(--color-editor-primary)] text-white border-[var(--color-editor-primary)]'
                                                                : 'bg-white text-[var(--color-neutral-500)] border-[var(--color-neutral-200)] hover:border-[var(--color-editor-primary)]'
                                                                }`}
                                                        >
                                                            {variant}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {block.type === 'image' && (
                                            <div className="space-y-3">
                                                <div className="aspect-[4/3] bg-white rounded-lg border border-[var(--color-neutral-200)] overflow-hidden relative group/img">
                                                    <img src={block.url} className="w-full h-full object-cover" alt="Block" />
                                                    <button
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white font-bold"
                                                        onClick={() => {
                                                            const input = document.createElement('input')
                                                            input.type = 'file'
                                                            input.accept = 'image/*'
                                                            input.onchange = async (e: any) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) {
                                                                    try {
                                                                        const url = await useEditorStore.getState().uploadMedia(file)
                                                                        const blocks = [...(activePage.content.blocks || [])]
                                                                        blocks[index] = { ...blocks[index], url }
                                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                                    } catch (err) { alert("Upload failed") }
                                                                }
                                                            }
                                                            input.click()
                                                        }}
                                                    >
                                                        Replace Image
                                                    </button>
                                                </div>
                                                <input
                                                    className="w-full p-2 bg-white rounded-lg border border-[var(--color-neutral-200)] focus:border-[var(--color-editor-primary)] focus:outline-none text-xs"
                                                    value={block.caption || ""}
                                                    onChange={(e) => {
                                                        const blocks = [...(activePage.content.blocks || [])]
                                                        blocks[index] = { ...blocks[index], caption: e.target.value }
                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                    }}
                                                    placeholder="Add a caption..."
                                                />
                                            </div>
                                        )}

                                        {/* Common Controls */}
                                        <div className="mt-3 pt-3 border-t border-[var(--color-neutral-200)] flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[var(--color-neutral-400)] uppercase font-bold">Rotation</span>
                                                <input
                                                    type="range"
                                                    min="-15"
                                                    max="15"
                                                    step="1"
                                                    value={block.rotation || 0}
                                                    onChange={(e) => {
                                                        const blocks = [...(activePage.content.blocks || [])]
                                                        blocks[index] = { ...blocks[index], rotation: parseInt(e.target.value) }
                                                        updatePage(activePage.id, { content: { ...activePage.content, blocks } })
                                                    }}
                                                    className="w-20 h-1 bg-[var(--color-neutral-200)] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--color-editor-primary)] [&::-webkit-slider-thumb]:rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(activePage.content.blocks || []).length === 0 && (
                                <div className="text-center py-8 text-[var(--color-neutral-400)] text-sm">
                                    No blocks added yet. Use the buttons above to add photos or text.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activePage && isCoupon(activePage) && (
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-bold text-[var(--color-neutral-400)] uppercase tracking-widest block">Coupons</label>
                            <button
                                onClick={() => {
                                    const newCoupon: Coupon = {
                                        id: `coupon-${Date.now()}`,
                                        title: "New Coupon",
                                        description: "Valid for...",
                                        isRedeemable: true,
                                    }
                                    updatePage(activePage.id, { content: { ...activePage.content, coupons: [...activePage.content.coupons, newCoupon] } })
                                }}
                                className="text-[10px] font-bold text-[var(--color-editor-primary)] bg-[var(--color-editor-primary)]/10 px-2 py-1 rounded hover:bg-[var(--color-editor-primary)]/20 transition-colors uppercase tracking-wide"
                            >
                                + Add
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activePage.content.coupons.map((coupon, idx) => (
                                <div key={coupon.id} className="p-4 rounded-xl bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-[var(--color-neutral-400)] uppercase">Coupon {idx + 1}</span>
                                        <button
                                            onClick={() => updatePage(activePage.id, { content: { ...activePage.content, coupons: activePage.content.coupons.filter(c => c.id !== coupon.id) } })}
                                            className="text-[var(--color-neutral-400)] hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-icons-round text-sm">close</span>
                                        </button>
                                    </div>
                                    <input
                                        className="w-full p-3 rounded-lg bg-white border border-[var(--color-neutral-200)] focus:border-[var(--color-editor-primary)] focus:outline-none text-sm font-bold text-[var(--color-neutral-800)]"
                                        value={coupon.title}
                                        onChange={(e) => {
                                            const newCoupons = [...activePage.content.coupons]
                                            newCoupons[idx] = { ...newCoupons[idx], title: e.target.value }
                                            updatePage(activePage.id, { content: { ...activePage.content, coupons: newCoupons } })
                                        }}
                                        placeholder="Coupon Title"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            {activePage && isSummary(activePage) && (
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar space-y-8">
                    <div>
                        <label className="text-xs font-bold text-[var(--color-neutral-400)] uppercase tracking-widest mb-4 block">Closing Message</label>
                        <textarea
                            className="w-full p-4 rounded-xl bg-[var(--color-neutral-50)] border-transparent focus:border-[var(--color-editor-primary)] focus:bg-white focus:ring-0 text-sm leading-relaxed text-[var(--color-neutral-700)] transition-all resize-none outline-none"
                            rows={8}
                            value={activePage.content.message || ""}
                            onChange={(e) => updatePage(activePage.id, { content: { ...activePage.content, message: e.target.value } })}
                            placeholder="Write a heartfelt closing message..."
                        ></textarea>
                    </div>
                </div>
            )}

            {!activePage && (
                <div className="flex-1 flex items-center justify-center text-[var(--color-neutral-400)] p-6 text-center">
                    <p>Select a page to edit content</p>
                </div>
            )}
        </aside>
    )
}
