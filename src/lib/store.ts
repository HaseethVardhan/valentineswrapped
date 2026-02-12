import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Page, Wrapped, PageType } from '../types'
import { api } from './api'

interface EditorState {
    wrapped: Wrapped | null
    activePageId: string | null
    isSaving: boolean

    drafts: Wrapped[]
    createWrapped: (options: { title: string, partnerName: string, isPasswordProtected: boolean, passwordHash?: string }) => Promise<string>
    loadWrapped: (slug: string) => Promise<void>
    deleteDraft: (slug: string) => void
    updateWrappedTitle: (title: string) => void
    updateWrapped: (updates: Partial<Wrapped>) => void

    addPage: (type: PageType) => void
    removePage: (pageId: string) => void
    updatePage: (pageId: string, updates: Partial<Page>) => void
    reorderPages: (activeId: string, overId: string) => void

    setActivePage: (pageId: string) => void
    save: () => Promise<string | void>
    redeemCoupon: (couponId: string) => Promise<void>
    uploadMedia: (file: File) => Promise<string>
}

export const useEditorStore = create<EditorState>()(persist((set, get) => ({
    wrapped: null,
    activePageId: null,
    isSaving: false,
    drafts: [],

    createWrapped: async ({ title, partnerName, isPasswordProtected, passwordHash }) => {
        // Local creation only - no API call yet
        const tempId = `temp-${Date.now()}`
        const tempSlug = `draft-${Date.now()}`

        const newWrapped: Wrapped = {
            id: tempId,
            slug: tempSlug,
            title,
            partnerName,
            isPasswordProtected,
            passwordHash,
            pages: [],
            createdAt: new Date().toISOString(),
            data: { pages: [] }
        }

        set((state) => ({
            wrapped: newWrapped,
            activePageId: null,
            drafts: [newWrapped, ...state.drafts]
        }))
        return tempSlug
    },

    loadWrapped: async (slug) => {
        const state = get()
        // Check local drafts first
        const localDraft = state.drafts.find(d => d.slug === slug)
        if (localDraft) {
            set({ wrapped: localDraft, activePageId: localDraft.pages[0]?.id || null })
            return
        }

        // Fetch from API
        const wrapped = await api.getWrapped(slug)
        if (wrapped) {
            set({ wrapped, activePageId: wrapped.pages[0]?.id || null })
        } else {
            throw new Error('Wrapped not found')
        }
    },

    deleteDraft: (slug) =>
        set((state) => ({
            drafts: state.drafts.filter(d => d.slug !== slug),
            // If deleting current, clear it? Maybe not needed for now.
        })),

    updateWrappedTitle: (title) =>
        set((state) => {
            if (!state.wrapped) return state
            const updated = { ...state.wrapped, title }
            return {
                wrapped: updated,
                drafts: state.drafts.map(d => d.slug === updated.slug ? updated : d)
            }
        }),

    updateWrapped: (updates) =>
        set((state) => {
            if (!state.wrapped) return state
            const updated = { ...state.wrapped, ...updates }
            return {
                wrapped: updated,
                drafts: state.drafts.map(d => d.slug === updated.slug ? updated : d)
            }
        }),

    addPage: (type) =>
        set((state) => {
            if (!state.wrapped) return state

            const newPageId = `page-${Date.now()}`
            const newPageOrder = state.wrapped.pages.length

            let newPage: Page

            if (type === 'scrapbook') {
                newPage = { id: newPageId, type, order: newPageOrder, content: { images: [], blocks: [] } }
            } else if (type === 'coupon') {
                newPage = { id: newPageId, type, order: newPageOrder, content: { coupons: [] } }
            } else {
                newPage = { id: newPageId, type, order: newPageOrder, content: { message: '' } }
            }

            const updatedWrapped = {
                ...state.wrapped,
                pages: [...state.wrapped.pages, newPage]
            }

            return {
                wrapped: updatedWrapped,
                activePageId: newPageId,
                drafts: state.drafts.map(d => d.slug === updatedWrapped.slug ? updatedWrapped : d)
            }
        }),

    removePage: (pageId) =>
        set((state) => {
            if (!state.wrapped) return state
            const newPages = state.wrapped.pages.filter(p => p.id !== pageId)
            const updatedWrapped = { ...state.wrapped, pages: newPages }
            return {
                wrapped: updatedWrapped,
                activePageId: state.activePageId === pageId ? newPages[0]?.id || null : state.activePageId,
                drafts: state.drafts.map(d => d.slug === updatedWrapped.slug ? updatedWrapped : d)
            }
        }),

    updatePage: (pageId, updates) =>
        set((state) => {
            if (!state.wrapped) return state
            const newPages = state.wrapped.pages.map(p =>
                p.id === pageId ? { ...p, ...updates } as Page : p
            )
            const updatedWrapped = { ...state.wrapped, pages: newPages }
            return {
                wrapped: updatedWrapped,
                drafts: state.drafts.map(d => d.slug === updatedWrapped.slug ? updatedWrapped : d)
            }
        }),

    reorderPages: (activeId, overId) =>
        set((state) => {
            if (!state.wrapped) return state
            const oldIndex = state.wrapped.pages.findIndex(p => p.id === activeId)
            const newIndex = state.wrapped.pages.findIndex(p => p.id === overId)

            if (oldIndex === -1 || newIndex === -1) return state

            const newPages = [...state.wrapped.pages]
            const [movedPage] = newPages.splice(oldIndex, 1)
            newPages.splice(newIndex, 0, movedPage)

            // Update order property
            const reordered = newPages.map((p, i) => ({ ...p, order: i }))
            const updatedWrapped = { ...state.wrapped, pages: reordered }

            return {
                wrapped: updatedWrapped,
                drafts: state.drafts.map(d => d.slug === updatedWrapped.slug ? updatedWrapped : d)
            }
        }),

    setActivePage: (id) => set({ activePageId: id }),

    save: async () => {
        const state = get()
        if (!state.wrapped) return

        set({ isSaving: true })
        try {
            // Check if it's a draft (temp ID)
            if (state.wrapped.id.startsWith('temp-')) {
                // First time save -> Create in DB
                const newWrapped = await api.createWrapped(state.wrapped)
                set({
                    wrapped: newWrapped,
                    // Update draft with real ID/slug
                    drafts: get().drafts.map(d => d.id === state.wrapped!.id ? newWrapped : d)
                })
                return newWrapped.slug
            } else {
                // Update existing
                await api.updateWrapped(state.wrapped.slug, state.wrapped)
                return state.wrapped.slug
            }
        } finally {
            set({ isSaving: false })
        }
    },

    redeemCoupon: async (couponId) => {
        const state = get()
        if (!state.wrapped) return

        const updatedWrapped = (await api.redeemCoupon(state.wrapped.slug, couponId))
        set(s => ({
            wrapped: updatedWrapped,
            drafts: s.drafts.map(d => d.slug === updatedWrapped.slug ? updatedWrapped : d)
        }))
    },

    uploadMedia: async (file) => {
        return await api.uploadMedia(file)
    }
}), {
    name: 'valentines-wrapped-storage',
    partialize: (state) => ({ wrapped: state.wrapped, activePageId: state.activePageId, drafts: state.drafts }),
}))
