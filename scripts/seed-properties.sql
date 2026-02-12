-- Seed Properties Table
INSERT INTO properties (id, name, address, price, "priceLabel", image, beds, baths, sqft, status, tags, featured)
VALUES 
  ('prop-1', 'Sunnyvale Villa', '123 Luxury Lane, Beverly Hills, CA', 4500000, 'Total Price', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 5, 4.5, 4200, 'For Sale', ARRAY['Luxury', 'Pool', 'Smart Home'], true),
  ('prop-2', 'Oceanfront Condo', '456 Marine Drive, Miami, FL', 1200000, 'Total Price', 'https://images.unsplash.com/photo-1567496898731-da3b2776f100?auto=format&fit=crop&w=800&q=80', 2, 2.0, 1500, 'For sale', ARRAY['Modern', 'Beachfront', 'Balcony'], true),
  ('prop-3', 'Mountain Retreat', '789 Cedar Ridge, Aspen, CO', 3200000, 'Total Price', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80', 4, 3.5, 3500, 'For Sale', ARRAY['Scenic', 'Fireplace', 'Garage'], false),
  ('prop-4', 'Urban Loft', '101 Broadway, New York, NY', 850000, 'Total Price', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 1, 1.0, 950, 'For Rent', ARRAY['Downtown', 'High Ceiling'], false),
  ('prop-5', 'Suburban Family Home', '202 Maple Ave, Austin, TX', 650000, 'Total Price', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80', 3, 2.5, 2200, 'For Sale', ARRAY['Big Backyard', 'Safe Neighborhood'], true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  price = EXCLUDED.price,
  "priceLabel" = EXCLUDED."priceLabel",
  image = EXCLUDED.image,
  beds = EXCLUDED.beds,
  baths = EXCLUDED.baths,
  sqft = EXCLUDED.sqft,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  featured = EXCLUDED.featured,
  "updatedAt" = timezone('utc'::text, now());
