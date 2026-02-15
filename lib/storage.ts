import { supabase } from './supabase';

/**
 * Uploads a file to Supabase via our secure API route.
 * @param file The file to upload
 * @param bucket The bucket name (will be used by the API)
 * @param folder The folder inside the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, bucket: string = 'properties', folder: string = ''): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('bucket', bucket); // Pass bucket to API

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
}

/**
 * Uploads multiple images for a property.
 * @param files Array of files to upload
 * @returns Array of public URLs
 */
export async function uploadPropertyImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => uploadFile(file, 'properties'));
    return Promise.all(uploadPromises);
}

/**
 * Deletes an image from Supabase storage.
 * @param url The public URL of the image to delete
 * @param bucket The bucket name
 */
export async function deleteFileFromUrl(url: string, bucket: string): Promise<void> {
    try {
        // Extract file path from public URL
        // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[filepath]
        const urlParts = url.split(`/public/${bucket}/`);
        if (urlParts.length !== 2) return;

        const filePath = urlParts[1];
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error(`Error deleting file: ${error.message}`);
        }
    } catch (err) {
        console.error('Failed to extract file path from URL', err);
    }
}
