import type { Wrapped, WrappedData } from "../types"
import { supabase } from "./supabase"
import { storage } from "./storage"

export const api = {
    createWrapped: async (data: Partial<Wrapped> & { password?: string }): Promise<Wrapped> => {
        const slug = crypto.randomUUID().replace(/-/g, '').substring(0, 12)

        // Always prioritize the flat pages array which is the source of truth in the editor
        const pages = data.pages || data.data?.pages || []
        const initialData: WrappedData = { pages }

        // Hash password server-side via Supabase RPC if provided
        let hashedPassword: string | null = null
        if (data.isPasswordProtected && data.password) {
            const { data: hash, error: hashError } = await supabase
                .rpc('hash_password', { raw_password: data.password })
            if (hashError) throw hashError
            hashedPassword = hash
        }

        const { data: wrappedData, error } = await supabase
            .from('wrappeds')
            .insert({
                slug,
                title: data.title || 'My Valentine',
                is_password_protected: !!data.isPasswordProtected,
                password_hash: hashedPassword,
                owner_name: data.ownerName,
                partner_name: data.partnerName,
                bg_music_url: data.bgMusicUrl,
                bg_music_start_time: data.bgMusicStartTime,
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

    updateWrapped: async (slug: string, updates: Partial<Wrapped> & { password?: string }): Promise<Wrapped> => {
        // First get the ID and current data to ensure we have a base
        const current = await api.getWrapped(slug)
        if (!current) throw new Error('Not found')

        // Prepare the payload
        const payload: Record<string, unknown> = {
            title: updates.title,
            is_password_protected: updates.isPasswordProtected,
            bg_music_url: updates.bgMusicUrl,
            bg_music_start_time: updates.bgMusicStartTime,
            global_theme: updates.globalTheme,
            owner_name: updates.ownerName,
            partner_name: updates.partnerName
        }

        // Hash password server-side if being updated
        if (updates.password) {
            const { data: hash, error: hashError } = await supabase
                .rpc('hash_password', { raw_password: updates.password })
            if (hashError) throw hashError
            payload.password_hash = hash
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

    verifyPassword: async (slug: string, password: string): Promise<boolean> => {
        const { data, error } = await supabase
            .rpc('verify_wrapped_password', {
                wrapped_slug: slug,
                raw_password: password
            })

        if (error) throw error
        return data === true
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
const mapWrappedFromDB = (db: Record<string, unknown>): Wrapped => {
    // Handle legacy data or empty data
    let data: WrappedData = (db.data as WrappedData) || { pages: [] }

    // Safely look for stringified JSON (common issue with some Supabase configurations)
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data)
        } catch {
            data = { pages: [] }
        }
    }

    // Ensure pages exists
    if (!data.pages) {
        data.pages = []
    }

    return {
        id: db.id as string,
        slug: db.slug as string,
        title: db.title as string,
        ownerName: db.owner_name as string | undefined,
        partnerName: db.partner_name as string | undefined,
        isPasswordProtected: db.is_password_protected as boolean,
        // passwordHash is intentionally NOT mapped — never send to frontend
        bgMusicUrl: db.bg_music_url as string | undefined,
        bgMusicStartTime: db.bg_music_start_time as number | undefined,
        globalTheme: db.global_theme as Wrapped['globalTheme'],
        createdAt: db.created_at as string,
        updatedAt: db.updated_at as string | undefined,
        data: data,
        pages: data.pages || [] // Populate pages from data for frontend compatibility
    }
}
