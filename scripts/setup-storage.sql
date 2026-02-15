-- Create the storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true), ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Clean up existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

-- Policy to allow public read access to all files in properties and blog buckets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('properties', 'blog') );

-- Policy to allow authenticated users (like our admin) to upload files
CREATE POLICY "Authenticated Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id IN ('properties', 'blog') );

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id IN ('properties', 'blog') );

-- Policy to allow authenticated users to delete files
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id IN ('properties', 'blog') );
