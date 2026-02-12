

export type EditorTab = 'pages' | 'preview' | 'edit'

interface MobileNavProps {
    activeTab: EditorTab
    setActiveTab: (tab: EditorTab) => void
    className?: string
}

export function MobileNav({ activeTab, setActiveTab, className = "" }: MobileNavProps) {
    return (
        <div className={`fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-50 md:hidden pb-safe ${className}`}>
            <button
                onClick={() => setActiveTab('pages')}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'pages' ? 'text-[var(--color-editor-primary)]' : 'text-gray-400'}`}
            >
                <span className="material-icons-round text-2xl mb-0.5">view_list</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Pages</span>
            </button>
            <button
                onClick={() => setActiveTab('preview')}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'preview' ? 'text-[var(--color-editor-primary)]' : 'text-gray-400'}`}
            >
                <span className="material-icons-round text-2xl mb-0.5">phone_iphone</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Preview</span>
            </button>
            <button
                onClick={() => setActiveTab('edit')}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'edit' ? 'text-[var(--color-editor-primary)]' : 'text-gray-400'}`}
            >
                <span className="material-icons-round text-2xl mb-0.5">edit</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Edit</span>
            </button>
        </div>
    )
}
