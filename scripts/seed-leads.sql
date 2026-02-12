-- Seed Leads Table
INSERT INTO leads (id, name, email, phone, "propertyInterest", "propertyDetails", budget, message, status)
VALUES 
  ('lead-1', 'Alice Johnson', 'alice@example.com', '+1-555-0101', 'Sunnyvale Villa', 'Inquiry about pool maintenance', '$4.5M', 'I am interested in this luxury villa. Does it come with a home gym?', 'New'),
  ('lead-2', 'Bob Smith', 'bob@example.com', '+1-555-0102', 'Oceanfront Condo', 'Inquiry about parking', '$1.2M', 'Looking for a vacation home. Is there underground parking available?', 'Contacted'),
  ('lead-3', 'Charlie Brown', 'charlie@example.com', '+1-555-0103', 'Mountain Retreat', 'Inquiry about pet policy', '$3.2M', 'Do you allow large dogs in this retreat?', 'Pending Review'),
  ('lead-4', 'Diana Prince', 'diana@example.com', '+1-555-0104', 'Urban Loft', 'Inquiry about lease terms', '$850k', 'Is the loft available for short-term rentals?', 'Scheduled Viewing'),
  ('lead-5', 'Eve Adams', 'eve@example.com', '+1-555-0105', 'Suburban Family Home', 'Inquiry about nearby schools', '$650k', 'I have two kids. Are there good schools in the area?', 'New')
ON CONFLICT (id) DO NOTHING;
