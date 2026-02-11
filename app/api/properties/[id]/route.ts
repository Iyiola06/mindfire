import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type RouteParams = {
    params: Promise<{ id: string }>
}

// GET /api/properties/[id] - Get single property
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { data: property, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ property })
    } catch (error) {
        console.error('Error fetching property:', error)
        return NextResponse.json(
            { error: 'Failed to fetch property' },
            { status: 500 }
        )
    }
}

// PUT /api/properties/[id] - Update property (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()

        const { data: property, error } = await supabase
            .from('properties')
            .update(body)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ property })
    } catch (error) {
        console.error('Error updating property:', error)
        return NextResponse.json(
            { error: 'Failed to update property' },
            { status: 500 }
        )
    }
}

// DELETE /api/properties/[id] - Delete property (admin only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting property:', error)
        return NextResponse.json(
            { error: 'Failed to delete property' },
            { status: 500 }
        )
    }
}
