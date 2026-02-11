import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const leadSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    propertyInterest: z.string().min(1),
    propertyDetails: z.string().optional(),
    budget: z.string().optional(),
    message: z.string().optional(),
})

// GET /api/leads - List all leads (admin only)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = supabase
            .from('leads')
            .select('*')
            .order('createdAt', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data: leads, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({ leads })
    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        )
    }
}

// POST /api/leads - Submit new lead (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = leadSchema.parse(body)

        const { data: lead, error } = await supabase
            .from('leads')
            .insert([validatedData])
            .select()
            .single()

        if (error) {
            throw error
        }

        // TODO: Send email notification to admin
        // TODO: Send confirmation email to customer

        return NextResponse.json({ lead }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating lead:', error)
        return NextResponse.json(
            { error: 'Failed to create lead' },
            { status: 500 }
        )
    }
}
