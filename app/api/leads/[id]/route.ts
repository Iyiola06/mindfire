import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'

type RouteParams = {
    params: Promise<{ id: string }>
}

// PATCH /api/leads/[id] - Update lead status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin()

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
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
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
        await requireAdmin()

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
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        console.error('Error deleting lead:', error)
        return NextResponse.json(
            { error: 'Failed to delete lead' },
            { status: 500 }
        )
    }
}
