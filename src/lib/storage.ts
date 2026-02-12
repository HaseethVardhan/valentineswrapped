const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL

export const storage = {
    uploadFile: async (file: File): Promise<string> => {
        if (!WORKER_URL) {
            throw new Error('Image upload is not configured. Please contact support.')
        }

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
            throw new Error(`Image upload failed (${response.status}): ${errorText}. Please try again.`)
        }

        // Return Public URL
        const publicDomain = import.meta.env.VITE_R2_PUBLIC_DOMAIN
        if (publicDomain) {
            // Ensure no double slashes if domain ends with /
            const domain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain
            return `${domain}/${key}`
        }

        throw new Error('Image upload configuration is incomplete. Please contact support.')
    }
}
