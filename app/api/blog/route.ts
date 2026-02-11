import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const blogPostSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    excerpt: z.string().min(1),
    content: z.string().min(1),
    author: z.string().min(1),
    authorAvatar: z.string().url().optional(),
    image: z.string().url().optional(),
    category: z.string().min(1),
    tags: z.array(z.string()),
    published: z.boolean().optional(),
})

// GET /api/blog - List blog posts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const publishedOnly = searchParams.get('published') !== 'false'
        const category = searchParams.get('category')

        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('publishedAt', { ascending: false })

        if (publishedOnly) {
            query = query.eq('published', true)
        }
        if (category) {
            query = query.eq('category', category)
        }

        const { data: posts, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({ posts })
    } catch (error) {
        console.error('Error fetching blog posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        )
    }
}

// POST /api/blog - Create new blog post (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = blogPostSchema.parse(body)

        const { data: post, error } = await supabase
            .from('blog_posts')
            .insert({
                ...validatedData,
                publishedAt: validatedData.published ? new Date() : null,
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ post }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating blog post:', error)
        return NextResponse.json(
            { error: 'Failed to create blog post' },
            { status: 500 }
        )
    }
}
