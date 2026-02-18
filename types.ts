export interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  currency?: 'USD' | 'NGN';
  priceLabel?: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Coming Soon' | 'Maintenance';
  tags: string[];
  featured?: boolean;
  description?: string;
  images?: string[];
  amenities?: string[];
  floorPlans?: { label: string; image: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  propertyInterest: string;
  propertyDetails: string;
  budget: string;
  date: string;
  time: string;
  status: 'New' | 'Contacted' | 'Pending Review' | 'Scheduled Viewing';
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  image: string;
  category: string;
  published: boolean;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: string;
  colorClass: string;
}
