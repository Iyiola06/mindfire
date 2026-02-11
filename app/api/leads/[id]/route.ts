import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type RouteParams = {
    params: Promise<{ id: string }>
}

// PATCH /api/leads/[id] - Update lead status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, contactedAt } = body

        const updateData: any = {}
        if (status) updateData.status = status
        if (contactedAt) updateData.contactedAt = new Date(contactedAt)

        const { data: lead, error } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ lead })
    } catch (error) {
        console.error('Error updating lead:', error)
        return NextResponse.json(
            { error: 'Failed to update lead' },
            { status: 500 }
        )
    }
}

// DELETE /api/leads/[id] - Delete lead (admin only)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting lead:', error)
        return NextResponse.json(
            { error: 'Failed to delete lead' },
            { status: 500 }
        )
    }
}
