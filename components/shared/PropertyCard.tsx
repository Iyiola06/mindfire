"use client"

import React from 'react';
import Link from 'next/link';
import { Property } from '../../types';
import { Badge } from '../ui/Badge';
import { IconHeart, IconMapPin, IconBed, IconBath, IconArea } from '../icons';

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
      {/* The card is a lifted plate: large radius, long-throw shadow, hairline
          edge. The photograph gets its own inner radius so the frame reads as
          a mount rather than as a bled image. */}
      <div className="flex h-full flex-col overflow-hidden rounded-showcase border border-hairline/[0.06] bg-surface p-3 shadow-ambient transition-all duration-short ease-standard hover:-translate-y-1 hover:shadow-lift">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-surface">
          <img
            src={property.image}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-spatial ease-standard group-hover:scale-105"
          />
          {property.tags.length > 0 && (
            <div className="absolute left-3.5 top-3.5 z-10 flex flex-wrap gap-2">
              {property.tags.map(tag => (
                <Badge key={tag} color={getBadgeColor(tag)}>{tag}</Badge>
              ))}
            </div>
          )}
          {/* The label names the property because a listings grid renders many
              of these. The handler stays a no-op — favouriting has no backing
              store yet — so the label describes what it will do. */}
          <button
            type="button"
            aria-label={`Add ${property.name} to favourites`}
            className="glass-capsule absolute right-3.5 top-3.5 z-10 flex h-10 w-10 items-center justify-center rounded-pill text-content transition-colors duration-short ease-standard hover:text-red-500"
            onClick={(e) => { e.preventDefault(); }}
          >
            <IconHeart size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
          {/* No line-clamp on the name, no truncate on the address — both were
              hiding the information a buyer is scanning for. */}
          <h3 className="font-display text-body-lg font-semibold tracking-tight text-content transition-colors duration-short group-hover:text-brand-600">
            {property.name}
          </h3>
          <p className="mt-2 flex items-start gap-1.5 text-body-sm text-content-muted">
            <IconMapPin size={16} className="mt-0.5 shrink-0" />
            <span>{property.address}</span>
          </p>

          {/* One value, one text node. 'en-NG' is explicit so grouping is the
              same in tests and in every visitor's browser. */}
          <p className="mt-4 flex items-baseline gap-1.5 font-display text-display-sm font-bold tracking-tight text-brand-600">
            {`${property.currency === 'NGN' ? '₦' : '$'}${property.price.toLocaleString('en-NG')}`}
            {property.priceLabel && (
              <span className="text-body-sm font-medium text-content-muted">{property.priceLabel}</span>
            )}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-hairline/10 pt-4 text-body-sm text-content-muted">
            <div className="flex items-center gap-1.5">
              <IconBed size={16} className="text-brand-600" />
              <span>{property.beds} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconBath size={16} className="text-brand-600" />
              <span>{property.baths} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconArea size={16} className="text-brand-600" />
              <span>{property.sqft.toLocaleString('en-NG')} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
