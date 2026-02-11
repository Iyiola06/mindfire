import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type RouteParams = {
    params: Promise<{ id: string }>
}

// GET /api/blog/[id] - Get single blog post
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { data: post, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !post) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ post })
    } catch (error) {
        console.error('Error fetching blog post:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        )
    }
}

// PUT /api/blog/[id] - Update blog post (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()

        // If publishing for the first time, set publishedAt
        const updateData: any = { ...body }
        if (body.published && !body.publishedAt) {
            updateData.publishedAt = new Date()
        }

        const { data: post, error } = await supabase
            .from('blog_posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ post })
    } catch (error) {
        console.error('Error updating blog post:', error)
        return NextResponse.json(
            { error: 'Failed to update blog post' },
            { status: 500 }
        )
    }
}

// DELETE /api/blog/[id] - Delete blog post (admin only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting blog post:', error)
        return NextResponse.json(
            { error: 'Failed to delete blog post' },
            { status: 500 }
        )
    }
}
