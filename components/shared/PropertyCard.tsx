"use client"

import React from 'react';
import Link from 'next/link';
import { Property } from '../../types';
import { Badge } from '../ui/Badge';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getBadgeColor = (tag: string) => {
    if (tag.toLowerCase().includes('sale') || tag.toLowerCase().includes('fast')) return 'secondary';
    if (tag.toLowerCase().includes('rent')) return 'gray';
    if (tag.toLowerCase().includes('new')) return 'primary';
    if (tag.toLowerCase().includes('hot')) return 'red';
    return 'primary';
  };

  return (
    <Link href={`/properties/${property.id}`} className="group block h-full">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <div className="relative h-64 overflow-hidden shrink-0">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {property.tags.length > 0 && (
            <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
              {property.tags.map(tag => (
                <Badge key={tag} color={getBadgeColor(tag)}>{tag}</Badge>
              ))}
            </div>
          )}
          <button
            className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-200 hover:text-red-500 hover:bg-white transition-colors z-10"
            onClick={(e) => { e.preventDefault(); /* handle like */ }}
          >
            <span className="material-icons-outlined text-lg">favorite_border</span>
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
            <p className="text-white font-bold text-xl flex items-baseline gap-1">
              ${property.price.toLocaleString()}
              {property.priceLabel && <span className="text-sm font-normal opacity-80">{property.priceLabel}</span>}
            </p>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2 line-clamp-1">
            {property.name}
          </h3>
          <p className="text-text-muted-light dark:text-text-muted-dark text-sm mb-4 flex items-center gap-1">
            <span className="material-icons-outlined text-sm shrink-0">location_on</span>
            <span className="truncate">{property.address}</span>
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="material-icons-outlined text-primary text-base">bed</span>
              <span>{property.beds} Beds</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-icons-outlined text-primary text-base">bathtub</span>
              <span>{property.baths} Baths</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-icons-outlined text-primary text-base">square_foot</span>
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
