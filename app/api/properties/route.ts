import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'
import { z } from 'zod'

/**
 * `beds` and `baths` are non-negative rather than positive: land and
 * commercial listings legitimately have zero of both, and the previous
 * `.positive()` made them impossible to create through this endpoint.
 *
 * The optional block below exists because the previous schema listed only the
 * eleven scalar columns, and `parse()` strips everything it does not declare —
 * so a property created here silently lost its description, gallery,
 * amenities, and floor plans.
 */
const propertySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    price: z.number().positive(),
    currency: z.enum(['NGN', 'USD']).optional(),
    priceLabel: z.string().optional(),
    image: z.string().url(),
    beds: z.number().int().min(0),
    baths: z.number().min(0),
    sqft: z.number().int().positive(),
    status: z.string().min(1),
    tags: z.array(z.string()),
    featured: z.boolean().optional(),
    description: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    amenities: z.array(z.string()).optional(),
    floorPlans: z.array(z.object({ label: z.string(), image: z.string().url() })).optional(),
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
        await requireAdmin()

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
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
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
