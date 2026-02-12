
import { motion } from "framer-motion"
import type { ScrapbookPage } from "../../types"
import { migrateScrapbookContent } from "../../lib/transformers"

interface ViewerScrapbookProps {
    page: ScrapbookPage
}

export function ViewerScrapbook({ page }: ViewerScrapbookProps) {
    // Determine blocks (use new format or migrate old format on the fly)
    const blocks = page.content.blocks || migrateScrapbookContent(page)

    return (
        <div className="flex h-full flex-col relative overflow-hidden">
            {/* Title */}
            {page.content.title && (
                <div className="z-10 mt-20 md:mt-8 mb-4 px-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold text-[var(--color-neutral-800)] font-handwriting transform -rotate-2 drop-shadow-sm"
                    >
                        {page.content.title}
                    </motion.h2>
                    {page.content.date && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm text-[var(--color-neutral-500)] font-medium uppercase tracking-widest mt-2"
                        >
                            {page.content.date}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Scrollable Canvas for Blocks */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 relative">
                <div className="flex flex-col items-center gap-12 py-8 min-h-full">
                    {blocks.map((block, index) => (
                        <motion.div
                            key={block.id}
                            initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: block.rotation || 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                                zIndex: block.zIndex || index,
                                maxWidth: '100%',
                                width: block.type === 'text' ? '90%' : 'auto'
                            }}
                            className="relative"
                        >
                            {block.type === 'image' && (
                                <div className="bg-white p-3 pb-10 shadow-xl transform transition-transform hover:scale-[1.02] hover:z-50 duration-300 w-full max-w-[320px] md:max-w-[480px] lg:max-w-[600px] mx-auto rotate-1 border border-white/50">
                                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden mb-2 shadow-inner">
                                        <img
                                            src={block.url}
                                            alt={block.caption || "Memory"}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute bottom-3 left-0 w-full text-center px-4">
                                        <p className="font-handwriting text-gray-700 text-xl leading-none">{block.caption}</p>
                                    </div>

                                    {/* Tape effect (pure css/visual) */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm shadow-sm transform -rotate-2"></div>
                                </div>
                            )}

                            {block.type === 'text' && (
                                <div className={`p-6 shadow-lg transform hover:scale-[1.02] transition-transform max-w-md md:max-w-xl lg:max-w-2xl mx-auto relative
                                    ${(block.variant || 'sticky') === 'sticky' ? 'bg-[#fff9c4] rotate-[-1deg] font-handwriting text-xl md:text-2xl' : ''}
                                    ${block.variant === 'paper' ? 'bg-white border border-gray-200 rotate-[1deg] font-serif' : ''}
                                    ${block.variant === 'card' ? 'bg-[#fafafa] border-[4px] border-double border-[var(--color-editor-primary)]/20 rotate-0 font-sans' : ''}
                                    ${block.variant === 'transparent' ? 'bg-transparent text-shadow-sm rotate-0 font-handwriting text-2xl font-bold text-[var(--color-editor-primary-dark)]' : ''}
                                `}>
                                    {/* Pin effect for sticky */}
                                    {(block.variant || 'sticky') === 'sticky' && (
                                        <div className="absolute -top-3 right-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500"></div>
                                    )}

                                    {/* Tape effect for paper */}
                                    {block.variant === 'paper' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm shadow-sm transform -rotate-2 border border-white/40"></div>
                                    )}

                                    <p className={`text-gray-800 leading-relaxed whitespace-pre-wrap
                                        ${block.variant === 'card' ? 'text-center italic' : ''}
                                        ${block.variant === 'transparent' ? 'text-[var(--color-editor-primary-dark)]' : ''}
                                    `}>
                                        {block.content}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {blocks.length === 0 && (
                        <div className="text-[var(--color-neutral-400)] text-center italic mt-20">
                            Waiting for your story...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
