import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff']

const MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = (formData.get('folder') as string) || 'uploads'
        const bucketName = (formData.get('bucket') as string) || 'properties'

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Determine extension from filename — this is always reliable
        const fileExt = file.name.split('.').pop()?.toLowerCase() || ''

        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
            return NextResponse.json({ error: 'File must be an image (jpg, png, gif, webp, avif, svg, bmp, tiff)' }, { status: 400 })
        }

        // Determine correct content type from extension (don't trust file.type from the browser)
        const contentType = MIME_TYPES[fileExt] || 'application/octet-stream'

        // Read file as ArrayBuffer for reliable binary upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Generate unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${folder}/${fileName}`

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

        console.log(`Uploaded to ${bucketName}/${filePath}`)

        return NextResponse.json({ url: publicUrl, path: filePath })

    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: `Internal server error: ${error?.message || 'Unknown'}` }, { status: 500 })
    }
}
