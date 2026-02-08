import { treaty } from '@elysiajs/eden'
import type { App } from '@/app/api/[[...slugs]]/route'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

export const apiClient = treaty<App>(baseUrl).api