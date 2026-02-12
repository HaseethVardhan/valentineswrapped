const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL

export const storage = {
    uploadFile: async (file: File): Promise<string> => {
        if (!WORKER_URL) {
            console.warn('VITE_R2_WORKER_URL is missing. Using mock URL.')
            return URL.createObjectURL(file)
        }

        try {
            // Direct Upload via Worker Proxy
            const key = `${crypto.randomUUID()}-${file.name}`

            // The worker expects a PUT request with the key as a query param
            const response = await fetch(`${WORKER_URL}?key=${key}`, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            })

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error')
                throw new Error(`Failed to upload to R2: ${response.status} ${errorText}`)
            }

            // const data = await response.json() // Unused

            // Return Public URL
            const publicDomain = import.meta.env.VITE_R2_PUBLIC_DOMAIN
            if (publicDomain) {
                // Ensure no double slashes if domain ends with /
                const domain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain
                return `${domain}/${key}`
            }

            console.warn('VITE_R2_PUBLIC_DOMAIN is missing. Returning key as fallback.')
            return key
        } catch (error) {
            console.error('Upload failed:', error)
            // Fallback to local object URL for development reliability if R2 fails
            return URL.createObjectURL(file)
        }
    }
}
