-- Create the 'properties' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to all files in the 'properties' bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'properties' );

-- Policy to allow authenticated users (like our admin) to upload files
CREATE POLICY "Authenticated Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'properties' );

-- Policy to allow authenticated users to update their own files (optional but good practice)
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'properties' );

-- Policy to allow authenticated users to delete files
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'properties' );
