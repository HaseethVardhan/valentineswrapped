import type { Wrapped, WrappedData } from "../types"
import { supabase } from "./supabase"
import { storage } from "./storage"

export const api = {
    createWrapped: async (data: Partial<Wrapped>): Promise<Wrapped> => {
        const slug = Math.random().toString(36).substring(2, 8)

        // Always prioritize the flat pages array which is the source of truth in the editor
        const pages = data.pages || data.data?.pages || []
        const initialData: WrappedData = { pages }

        const { data: wrappedData, error } = await supabase
            .from('wrappeds')
            .insert({
                slug,
                title: data.title || 'My Valentine',
                is_password_protected: !!data.isPasswordProtected,
                password_hash: data.passwordHash,
                owner_name: data.ownerName,
                partner_name: data.partnerName,
                bg_music_url: data.bgMusicUrl,
                global_theme: data.globalTheme,
                data: initialData
            })
            .select()
            .single()

        if (error) throw error

        return mapWrappedFromDB(wrappedData)
    },

    getWrapped: async (slug: string): Promise<Wrapped | null> => {
        const { data: wrappedData, error } = await supabase
            .from('wrappeds')
            .select('*')
            .eq('slug', slug)
            .single()

        if (error || !wrappedData) return null

        return mapWrappedFromDB(wrappedData)
    },

    updateWrapped: async (slug: string, updates: Partial<Wrapped>): Promise<Wrapped> => {
        // First get the ID and current data to ensure we have a base
        const current = await api.getWrapped(slug)
        if (!current) throw new Error('Not found')

        // Prepare the payload
        const payload: any = {
            title: updates.title,
            is_password_protected: updates.isPasswordProtected,
            password_hash: updates.passwordHash,
            bg_music_url: updates.bgMusicUrl,
            global_theme: updates.globalTheme,
            owner_name: updates.ownerName,
            partner_name: updates.partnerName
        }

        // If pages are being updated, we update the data column
        if (updates.pages) {
            payload.data = { pages: updates.pages }
        }

        const { error: wrappedError } = await supabase
            .from('wrappeds')
            .update(payload)
            .eq('id', current.id)

        if (wrappedError) throw wrappedError

        return (await api.getWrapped(slug)) as Wrapped
    },

    uploadMedia: async (file: File): Promise<string> => {
        return await storage.uploadFile(file)
    },

    redeemCoupon: async (slug: string, couponId: string): Promise<Wrapped> => {
        const wrapped = await api.getWrapped(slug)
        if (!wrapped) throw new Error('Not found')

        // Find the page with the coupon
        const pageIndex = wrapped.pages.findIndex(p => p.type === 'coupon')
        if (pageIndex === -1) return wrapped

        const page = wrapped.pages[pageIndex]
        if (page.type !== 'coupon') return wrapped // Typescript guard check

        const hasCoupon = page.content.coupons.some(c => c.id === couponId)
        if (!hasCoupon) return wrapped

        // Update the content in memory
        const newCoupons = page.content.coupons.map(c =>
            c.id === couponId ? { ...c, isRedeemable: false, isRedeemed: true, redeemedAt: new Date().toISOString() } : c
        )

        // Deep clone pages to avoid mutating the original reference before send
        const newPages = [...wrapped.pages]
        newPages[pageIndex] = {
            ...page,
            content: { ...page.content, coupons: newCoupons }
        }

        // Update in DB - Just a simple update of the data column
        await supabase
            .from('wrappeds')
            .update({ data: { pages: newPages } })
            .eq('id', wrapped.id)

        return (await api.getWrapped(slug)) as Wrapped
    }
}

// Helpers to map DB snake_case to CamelCase
// Helpers to map DB snake_case to CamelCase
const mapWrappedFromDB = (db: any): Wrapped => {
    // Handle legacy data or empty data
    let data: WrappedData = db.data || { pages: [] }

    // Safely look for stringified JSON (common issue with some Supabase configurations)
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data)
        } catch (e) {
            console.error("Failed to parse wrapped data", e)
            data = { pages: [] }
        }
    }

    // Ensure pages exists
    if (!data.pages) {
        data.pages = []
    }

    return {
        id: db.id,
        slug: db.slug,
        title: db.title,
        ownerName: db.owner_name,
        partnerName: db.partner_name,
        isPasswordProtected: db.is_password_protected,
        passwordHash: db.password_hash,
        bgMusicUrl: db.bg_music_url,
        globalTheme: db.global_theme,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
        data: data,
        pages: data.pages || [] // Populate pages from data for frontend compatibility
    }
}
