import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const propertySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    price: z.number().positive(),
    priceLabel: z.string().optional(),
    image: z.string().url(),
    beds: z.number().int().positive(),
    baths: z.number().positive(),
    sqft: z.number().int().positive(),
    status: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
})

// GET /api/properties - List all properties with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const featured = searchParams.get('featured')
        const status = searchParams.get('status')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const beds = searchParams.get('beds')

        let query = supabase
            .from('properties')
            .select('*')
            .order('createdAt', { ascending: false })

        if (featured === 'true') {
            query = query.eq('featured', true)
        }
        if (status) {
            query = query.eq('status', status)
        }
        if (beds) {
            query = query.eq('beds', parseInt(beds))
        }
        if (minPrice) {
            query = query.gte('price', parseFloat(minPrice))
        }
        if (maxPrice) {
            query = query.lte('price', parseFloat(maxPrice))
        }

        const { data: properties, error } = await query

        if (error) {
            throw error
        }

        return NextResponse.json({ properties })
    } catch (error) {
        console.error('Error fetching properties:', error)
        return NextResponse.json(
            { error: 'Failed to fetch properties' },
            { status: 500 }
        )
    }
}

// POST /api/properties - Create new property (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = propertySchema.parse(body)

        const { data: property, error } = await supabase
            .from('properties')
            .insert([validatedData])
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ property }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating property:', error)
        return NextResponse.json(
            { error: 'Failed to create property' },
            { status: 500 }
        )
    }
}
