import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { notifyNewLead } from '@/lib/notify'

const contactSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional(),
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(4000),
})

/**
 * POST /api/contact — public contact submission.
 *
 * This route previously validated the payload, wrote it to `console.log` under
 * a `// TODO: Implement email sending`, and returned
 * "Thank you for contacting us. We will get back to you soon." Every enquiry
 * that arrived here was acknowledged to the sender and then discarded.
 *
 * It now does what the response claims: the enquiry is stored as a lead, so it
 * appears in the admin, and the team is emailed. A failed notification does not
 * fail the request — the row is already safe, and telling a visitor their
 * message failed when it did not is the worse error.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const data = contactSchema.parse(body)

        const { data: lead, error } = await supabase
            .from('leads')
            .insert([
                {
                    name: data.name.trim(),
                    email: data.email.trim(),
                    phone: data.phone?.trim() || null,
                    propertyInterest: data.subject.trim(),
                    message: data.message.trim(),
                    status: 'New',
                },
            ])
            .select()
            .single()

        if (error) {
            console.error('Error storing contact submission:', error)
            return NextResponse.json(
                { error: 'We could not save your message. Please try again.' },
                { status: 500 },
            )
        }

        await notifyNewLead({
            name: data.name,
            email: data.email,
            phone: data.phone,
            propertyInterest: data.subject,
            message: data.message,
        })

        return NextResponse.json(
            {
                success: true,
                id: lead?.id,
                message: 'Thank you for contacting us. An advisor will reply within one business day.',
            },
            { status: 201 },
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 },
            )
        }

        console.error('Error processing contact form:', error)
        return NextResponse.json({ error: 'Failed to process contact form' }, { status: 500 })
    }
}
