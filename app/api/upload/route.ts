import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'

// Initialize Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * SVG is deliberately absent. An SVG served from the public bucket as
 * `image/svg+xml` is a script-bearing document on the storage origin, and this
 * endpoint writes with the service-role key. Raster formats only.
 */
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'] as const

const MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
}

/** Buckets this endpoint may write to. The bucket name arrives in the form
    body, so without this an authenticated caller could target any bucket in
    the project. */
const ALLOWED_BUCKETS = ['properties', 'blog'] as const

const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
    try {
        // This route holds the service-role key and bypasses RLS. It ran
        // completely unauthenticated: the middleware matcher never covered it.
        await requireAdmin()

        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = (formData.get('folder') as string) || 'uploads'
        const requestedBucket = (formData.get('bucket') as string) || 'properties'

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: `File is larger than the ${MAX_BYTES / 1024 / 1024}MB limit` },
                { status: 413 },
            )
        }

        const bucketName = (ALLOWED_BUCKETS as readonly string[]).includes(requestedBucket)
            ? requestedBucket
            : 'properties'

        // Determine extension from filename — this is always reliable
        const fileExt = file.name.split('.').pop()?.toLowerCase() || ''

        if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(fileExt)) {
            return NextResponse.json(
                { error: 'File must be an image (jpg, png, gif, webp, avif)' },
                { status: 400 },
            )
        }

        // Determine correct content type from extension (don't trust file.type from the browser)
        const contentType = MIME_TYPES[fileExt]

        // Read file as ArrayBuffer for reliable binary upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Generate unique filename. The folder is reduced to a single safe
        // segment so a crafted value cannot traverse out of it.
        const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'uploads'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${safeFolder}/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType,
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            console.error('Supabase storage upload error:', uploadError)
            return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl, path: filePath })
    } catch (error: unknown) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
