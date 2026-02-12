export type MediaType = 'image' | 'video'

export interface Media {
    id: string
    url: string
    type: MediaType
    key?: string // R2 key
}

export type PageType = 'scrapbook' | 'coupon' | 'summary'

export interface BasePage {
    id: string
    type: PageType
    order: number
    theme?: PageTheme
}

export interface ScrapbookBlock {
    id: string
    type: 'text' | 'image' | 'sticker'
    content?: string // For text blocks
    url?: string // For image blocks
    caption?: string // For image blocks
    width?: number
    height?: number
    x?: number // For free positioning (optional phase 2)
    y?: number // For free positioning (optional phase 2)
    rotation?: number // For that messy scrapbook feel
    scale?: number
    zIndex?: number
    variant?: 'sticky' | 'card' | 'paper' | 'transparent'
}

export interface ScrapbookPage extends BasePage {
    type: 'scrapbook'
    content: {
        title?: string
        text?: string // Deprecated, use blocks
        date?: string
        images: {     // Deprecated, use blocks
            id: string
            url: string
            caption?: string
            width?: number
            height?: number
        }[]
        blocks: ScrapbookBlock[]
    }
}

export interface Coupon {
    id: string
    title: string
    description: string
    isRedeemable: boolean
    isRedeemed?: boolean
    redeemedAt?: string
    icon?: string
}

export interface CouponPage extends BasePage {
    type: 'coupon'
    content: {
        coupons: Coupon[]
    }
}

export interface SummaryPage extends BasePage {
    type: 'summary'
    content: {
        message: string
    }
}

export type Page = ScrapbookPage | CouponPage | SummaryPage

export interface PageTheme {
    backgroundColor: string
    textColor: string
    fontFamily: string
    animation?: string
}

export interface WrappedData {
    pages: Page[]
}

export interface Wrapped {
    id: string
    slug: string
    title: string
    ownerName?: string
    partnerName?: string
    passwordHash?: string
    isPasswordProtected: boolean
    data: WrappedData
    pages: Page[] // Kept for frontend compatibility, will be mapped from data.pages
    globalTheme?: PageTheme
    bgMusicUrl?: string
    bgMusicStartTime?: number // Start time in seconds
    createdAt: string
    updatedAt?: string
}
