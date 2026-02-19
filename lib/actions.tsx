'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'
import { resend } from './resend'
import { EmailTemplate } from '@/components/email/EmailTemplate'

// --- Property Actions ---

// Only pass columns that actually exist in the properties table
function sanitizeProperty(data: any) {
    return {
        name: data.name,
        address: data.address,
        price: data.price,
        currency: data.currency ?? 'USD',
        image: data.image,
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        status: data.status,
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        description: data.description ?? null,
        amenities: data.amenities ?? [],
        images: data.images ?? [],
        floorPlans: data.floorPlans ?? [],
    }
}

export async function createProperty(formData: any) {
    const { data, error } = await supabase
        .from('properties')
        .insert([sanitizeProperty(formData)])
        .select()

    if (error) {
        console.error('Error creating property:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/properties')
    revalidatePath('/properties')
    revalidatePath('/')
    return { success: true, data }
}

export async function updateProperty(id: string, formData: any) {
    const { data, error } = await supabase
        .from('properties')
        .update(sanitizeProperty(formData))
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating property:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/properties')
    revalidatePath('/properties')
    revalidatePath('/')
    return { success: true, data }
}

export async function deleteProperty(id: string) {
    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting property:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/properties')
    revalidatePath('/properties')
    revalidatePath('/')
    return { success: true }
}

// --- Lead Actions ---

export async function createLead(formData: any) {
    const { data, error } = await supabase
        .from('leads')
        .insert([{
            ...formData,
            status: 'New',
            createdAt: new Date().toISOString()
        }])
        .select()

    if (error) {
        console.error('Error creating lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/leads')
    revalidatePath('/admin')
    return { success: true, data }
}

export async function updateLeadStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating lead status:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/leads')
    revalidatePath('/admin')
    return { success: true, data }
}

export async function deleteLead(id: string) {
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/leads')
    revalidatePath('/admin')
    return { success: true }
}

// --- Blog Actions ---

export async function createBlogPost(formData: any) {
    const { data, error } = await supabase
        .from('blog_posts')
        .insert([formData])
        .select()

    if (error) {
        console.error('Error creating blog post:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true, data }
}

export async function updateBlogPost(id: string, formData: any) {
    const { data, error } = await supabase
        .from('blog_posts')
        .update(formData)
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating blog post:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true, data }
}

export async function deleteBlogPost(id: string) {
    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting blog post:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true }
}

// --- Newsletter Actions ---

export async function subscribeToNewsletter(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Invalid email address' }
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }])

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { success: true, message: 'Already subscribed' }
        }
        console.error('Error subscribing to newsletter:', error)
        return { success: false, error: error.message }
    }

    // Send Welcome Email
    try {
        await resend.emails.send({
            from: 'Mindfire Homes <onboarding@resend.dev>', // Update this with verified domain later
            to: email,
            subject: 'Welcome to Mindfire Homes',
            react: <EmailTemplate
                title="Welcome to the Inner Circle"
                content={`
                    <p>Thank you for subscribing to the Mindfire Homes newsletter.</p>
                    <p>You'll recall that we redefine modern living. Now, you'll be the first to know about:</p>
                    <ul>
                        <li>Exclusive off-market listings</li>
                        <li>Investment insights and market trends</li>
                        <li>upcoming VIP events</li>
                    </ul>
                    <p>Stay tuned.</p>
                `}
            />
        });
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the subscription if email fails, just log it.
    }

    return { success: true }
}

export async function sendBulkEmail(subject: string, content: string) {
    // In a real app, verify admin session here.

    // 1. Fetch all subscribers
    const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email');

    if (error || !subscribers) {
        return { success: false, error: 'Failed to fetch subscribers' };
    }

    if (subscribers.length === 0) {
        return { success: true, count: 0 };
    }

    // 2. Send emails (looping for MVP, use Batch API or Queues for scale)
    let sentCount = 0;
    const errors = [];

    // Chunking could be added here if list is > 100 for batch API
    for (const sub of subscribers) {
        try {
            await resend.emails.send({
                from: 'Mindfire Homes <onboarding@resend.dev>',
                to: sub.email,
                subject: subject,
                react: <EmailTemplate title={subject} content={content} />
            });
            sentCount++;
        } catch (err: any) {
            console.error(`Failed to send to ${sub.email}:`, err);
            errors.push(sub.email);
        }
    }

    return { success: true, sent: sentCount, failed: errors.length };
}
