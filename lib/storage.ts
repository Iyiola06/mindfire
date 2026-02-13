import { supabase } from './supabase';

/**
 * Uploads a file to a Supabase storage bucket.
 * @param file The file to upload
 * @param bucket The bucket name
 * @param folder The folder inside the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, bucket: string, folder: string = ''): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return data.publicUrl;
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
