/**
 * Image compression and validation utilities
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const MAX_WIDTH = 1920 // Maximum width for compressed images
const MAX_HEIGHT = 1920 // Maximum height for compressed images
const COMPRESSION_QUALITY = 0.8 // JPEG quality (0-1)

export interface CompressionResult {
    file: File
    wasCompressed: boolean
    originalSize: number
    compressedSize: number
}

/**
 * Validates if a file is an image and within size limits
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Please select an image file' }
    }

    // Check file size (before compression)
    if (file.size > MAX_FILE_SIZE * 2) { // Allow up to 10MB before compression
        return {
            valid: false,
            error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please select an image smaller than 10MB.`
        }
    }

    return { valid: true }
}

/**
 * Compresses an image file using canvas
 * Returns a new File object with compressed data
 */
export async function compressImage(file: File): Promise<CompressionResult> {
    const originalSize = file.size

    // If file is already small enough and is PNG/GIF, don't compress
    if (file.size <= MAX_FILE_SIZE && (file.type === 'image/png' || file.type === 'image/gif')) {
        return {
            file,
            wasCompressed: false,
            originalSize,
            compressedSize: file.size
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width
                let height = img.height

                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
                    width = Math.floor(width * ratio)
                    height = Math.floor(height * ratio)
                }

                // Create canvas and draw image
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'))
                            return
                        }

                        // Check if compressed file is still too large
                        if (blob.size > MAX_FILE_SIZE) {
                            // Try with lower quality
                            canvas.toBlob(
                                (secondBlob) => {
                                    if (!secondBlob) {
                                        reject(new Error('Failed to compress image'))
                                        return
                                    }

                                    if (secondBlob.size > MAX_FILE_SIZE) {
                                        reject(new Error(`Image is still too large after compression (${(secondBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 5MB.`))
                                        return
                                    }

                                    const compressedFile = new File([secondBlob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now()
                                    })

                                    resolve({
                                        file: compressedFile,
                                        wasCompressed: true,
                                        originalSize,
                                        compressedSize: secondBlob.size
                                    })
                                },
                                'image/jpeg',
                                0.6 // Lower quality for second attempt
                            )
                            return
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        })

                        resolve({
                            file: compressedFile,
                            wasCompressed: true,
                            originalSize,
                            compressedSize: blob.size
                        })
                    },
                    'image/jpeg',
                    COMPRESSION_QUALITY
                )
            }

            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Main function to process an image: validate and compress if needed
 */
export async function processImage(file: File): Promise<CompressionResult> {
    // First validate
    const validation = validateImage(file)
    if (!validation.valid) {
        throw new Error(validation.error)
    }

    // Then compress
    return await compressImage(file)
}
