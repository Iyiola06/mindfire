'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'
import { getResend } from './resend'
import { getAdmin } from './auth'
import { notifyNewLead } from './notify'
import { EmailTemplate } from '@/components/email/EmailTemplate'

/**
 * Server actions are a public HTTP surface. Anything exported from this file
 * can be invoked by anyone who can POST to the site — middleware does not run
 * for action invocations, and there is no route to protect.
 *
 * Only `createLead` and `subscribeToNewsletter` are meant to be public. Every
 * other action in this file writes to, deletes from, or emails on behalf of
 * the business, so each one opens with this guard. Before it existed,
 * `sendBulkEmail` — which mails the entire subscriber list — carried the
 * comment "In a real app, verify admin session here" and no check.
 */
async function guard(): Promise<{ success: false; error: string } | null> {
    const admin = await getAdmin()
    return admin ? null : { success: false, error: 'Not authorised. Please sign in again.' }
}

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
    const denied = await guard()
    if (denied) return denied

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
    const denied = await guard()
    if (denied) return denied

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
    const denied = await guard()
    if (denied) return denied

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

/** Public forms post to this action, so the payload is whatever the browser
    chose to send. Only these columns are accepted: spreading the raw body into
    the insert would let a caller set `status`, `contactedAt`, or `id` on a row
    the admin dashboard trusts. Values are trimmed and length-capped so a
    scripted submission cannot store unbounded text. */
function sanitizeLead(data: any) {
    const str = (v: unknown, max: number) =>
        typeof v === 'string' ? v.trim().slice(0, max) : '';

    return {
        name: str(data?.name, 120),
        email: str(data?.email, 200),
        phone: str(data?.phone, 40) || null,
        propertyInterest: str(data?.propertyInterest, 200),
        propertyDetails: str(data?.propertyDetails, 500) || null,
        budget: str(data?.budget, 100) || null,
        message: str(data?.message, 4000) || null,
    }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function createLead(formData: any) {
    const lead = sanitizeLead(formData)

    // Server-side validation. The client marks these fields required, but a
    // form post does not have to come from the client.
    if (!lead.name || !EMAIL_RE.test(lead.email) || !lead.propertyInterest) {
        return { success: false, error: 'Please provide your name, a valid email address, and what your enquiry is about.' }
    }

    const { data, error } = await supabase
        .from('leads')
        .insert([{
            ...lead,
            status: 'New',
            createdAt: new Date().toISOString()
        }])
        .select()

    if (error) {
        console.error('Error creating lead:', error)
        // The database message can name columns and constraints. Log it, but
        // return something a visitor can act on instead.
        return { success: false, error: 'We could not save your enquiry. Please try again.' }
    }

    // The team is emailed after the row is safe. `notifyNewLead` never throws:
    // a mail failure must not turn a stored enquiry into an error the visitor
    // sees, because retrying would duplicate the lead.
    await notifyNewLead(lead)

    revalidatePath('/admin/leads')
    revalidatePath('/admin')
    return { success: true, data }
}

export async function updateLeadStatus(id: string, status: string) {
    const denied = await guard()
    if (denied) return denied

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
    const denied = await guard()
    if (denied) return denied

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

/** Same reasoning as `sanitizeProperty`: only real columns reach the insert,
    so a stray key from the client cannot set `id` or `createdAt`. */
function sanitizeBlogPost(data: any) {
    return {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        authorAvatar: data.authorAvatar ?? null,
        image: data.image || null,
        category: data.category,
        tags: data.tags ?? [],
        published: data.published ?? false,
        publishedAt: data.publishedAt ?? null,
    }
}

export async function createBlogPost(formData: any) {
    const denied = await guard()
    if (denied) return denied

    const { data, error } = await supabase
        .from('blog_posts')
        .insert([sanitizeBlogPost(formData)])
        .select()

    if (error) {
        console.error('Error creating blog post:', error)
        // 23505 is the UNIQUE violation on `slug`. The raw Postgres text names
        // the constraint and means nothing to the person writing the article.
        return {
            success: false,
            error: error.code === '23505'
                ? 'An article with that URL slug already exists. Give this one a different slug.'
                : error.message,
        }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true, data }
}

export async function updateBlogPost(id: string, formData: any) {
    const denied = await guard()
    if (denied) return denied

    const { data, error } = await supabase
        .from('blog_posts')
        .update(sanitizeBlogPost(formData))
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating blog post:', error)
        return {
            success: false,
            error: error.code === '23505'
                ? 'An article with that URL slug already exists. Give this one a different slug.'
                : error.message,
        }
    }

    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath('/')
    return { success: true, data }
}

export async function deleteBlogPost(id: string) {
    const denied = await guard()
    if (denied) return denied

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
    // Length cap before anything else: an unbounded string reaching the insert
    // is free storage for whoever sends it.
    const address = typeof email === 'string' ? email.trim().slice(0, 200) : ''

    if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        return { success: false, error: 'Please enter a valid email address' }
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: address }])

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { success: true, message: 'Already subscribed' }
        }
        // Logged server-side, generic to the caller. `error.message` can name
        // tables, columns, and constraints — that belongs in the log, not in a
        // response to an anonymous form post.
        console.error('Error subscribing to newsletter:', error)
        return { success: false, error: 'We could not complete that subscription' }
    }

    // Send Welcome Email. A subscription that cannot be acknowledged is still
    // a subscription, so a missing API key is a warning rather than a failure.
    const resend = getResend()
    try {
        if (!resend) throw new Error('RESEND_API_KEY is not set')
        await resend.emails.send({
            from: 'Mindfire Homes <onboarding@resend.dev>', // Update this with verified domain later
            to: address,
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
    const denied = await guard()
    if (denied) return denied

    // 1. Fetch all subscribers
    const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email');

    if (error || !subscribers) {
        console.error('Error fetching subscribers:', error);
        return { success: false, error: 'Could not read the subscriber list.' };
    }

    // One shape for every success path. The zero-subscriber case used to
    // return `{ count: 0 }` while the normal path returned `{ sent, failed }`,
    // so the caller read `undefined` and rendered "sent to 0 subscribers".
    if (subscribers.length === 0) {
        return { success: true, sent: 0, failed: 0 };
    }

    const resend = getResend();
    if (!resend) {
        return { success: false, error: 'Email is not configured on this deployment (RESEND_API_KEY is unset).' };
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
