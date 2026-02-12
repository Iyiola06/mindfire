'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'

// --- Property Actions ---

export async function createProperty(formData: any) {
    const { data, error } = await supabase
        .from('properties')
        .insert([formData])
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
        .update(formData)
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
