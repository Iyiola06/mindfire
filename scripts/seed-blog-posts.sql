-- Insert Blog Posts
-- Slugs are generated from titles.
-- IDs are preserved from mock data where possible or auto-generated.

INSERT INTO blog_posts (id, title, slug, excerpt, content, author, "authorAvatar", image, category, tags, published, "publishedAt")
VALUES
(
  '1', 
  'Top 10 Emerging Neighborhoods for Real Estate Investment in 2024', 
  'top-10-emerging-neighborhoods-2024',
  'Discover the hidden gems in the real estate market that promise high ROI over the next decade. We analyze market trends and infrastructure plans.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.',
  'Elena Rodriguez',
  'https://i.pravatar.cc/150?u=10',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'Market Trends',
  ARRAY['Investment', 'Market Trends', '2024'],
  true,
  '2023-10-15 00:00:00+00'
),
(
  '2',
  'The Rise of Smart Homes: Why Tech-Integrated Properties Sell Faster',
  'rise-of-smart-homes',
  'Smart home technology is no longer a luxury, but an expectation. Learn how integrating tech can increase your property value and appeal to modern buyers.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.',
  'James Wilson',
  'https://i.pravatar.cc/150?u=11',
  'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'Home Improvement',
  ARRAY['Tech', 'Smart Home', 'Real Estate'],
  true,
  '2023-10-08 00:00:00+00'
),
(
  '3',
  'Understanding Property Taxes: A Guide for First-Time Homebuyers',
  'guide-to-property-taxes',
  'Navigate the complex world of property taxes with our comprehensive guide designed specifically for those making their first real estate purchase.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.',
  'Michael Chang',
  'https://i.pravatar.cc/150?u=12',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'Finance',
  ARRAY['Finance', 'Taxes', 'Homebuying'],
  true,
  '2023-09-28 00:00:00+00'
),
(
  '4',
  'Minimalist Interior Design: Maximizing Space and Value',
  'minimalist-interior-design',
  'Less is more. See how adopting a minimalist interior design can make spaces feel larger and more inviting to potential buyers or renters.',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.',
  'Sarah Jenkins',
  'https://i.pravatar.cc/150?u=13',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'Design',
  ARRAY['Design', 'Minimalism', 'Interior'],
  false,
  '2023-09-15 00:00:00+00'
)
ON CONFLICT (id) DO NOTHING;
