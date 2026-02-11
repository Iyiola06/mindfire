import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    subject: z.string().min(1),
    message: z.string().min(1),
})

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = contactSchema.parse(body)

        // TODO: Implement email sending using nodemailer or similar
        // For now, just log the contact submission
        console.log('Contact form submission:', validatedData)

        // You can also store in database if needed
        // await prisma.contactSubmission.create({ data: validatedData })

        return NextResponse.json(
            {
                success: true,
                message: 'Thank you for contacting us. We will get back to you soon.'
            },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error processing contact form:', error)
        return NextResponse.json(
            { error: 'Failed to process contact form' },
            { status: 500 }
        )
    }
}
