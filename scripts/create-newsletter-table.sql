-- Create a table for newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe" 
ON newsletter_subscribers FOR INSERT 
WITH CHECK (true);

-- Only admins can view (assuming service role or authenticated admin logic later)
-- For now, we'll just leave it open for inserts. Selects can be restricted.
CREATE POLICY "Admins can view subscribers" 
ON newsletter_subscribers FOR SELECT 
USING (auth.role() = 'service_role');
