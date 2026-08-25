// components/admin/avatar.tsx
// Shared customer avatar (image with initials fallback), used by the admin
// orders list (app/admin/customers/orders/page.tsx) and the order details
// page (app/admin/customers/orders/[id]/page.tsx).

'use client';

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';

const AVATAR_COLORS = [
  'bg-[#002d62]',
  'bg-[#1e8e3e]',
  'bg-[#b06000]',
  'bg-[#5f6368]',
  'bg-[#137333]',
  'bg-[#9334e6]',
  'bg-[#d93025]',
  'bg-[#1967d2]',
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const Avatar = memo(
  ({
    src,
    firstName,
    lastName,
    size = 40,
  }: {
    src: string | null;
    firstName: string | null;
    lastName: string;
    size?: number;
  }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getInitials = useCallback(() => {
      const first = firstName?.[0] || '';
      const last = lastName?.[0] || '';
      return `${first}${last}`.toUpperCase() || '?';
    }, [firstName, lastName]);

    const fullName = `${firstName || ''} ${lastName}`.trim();
    const bgColor = getAvatarColor(fullName || '?');

    if (!src || hasError) {
      return (
        <div
          className={`${bgColor} rounded-full flex items-center justify-center text-white font-semibold border border-[#e0e3e5] cursor-help transition-colors duration-200 hover:opacity-80`}
          style={{
            width: size,
            height: size,
            fontSize: size * 0.4,
          }}
          title={fullName || 'Usuario'}
        >
          {getInitials()}
        </div>
      );
    }

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={fullName || 'Usuario'}
          width={size}
          height={size}
          className={`rounded-full object-cover border border-[#e0e3e5] bg-[#f2f4f6] ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } transition-all duration-200`}
          loading="lazy"
          unoptimized
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
        {isLoading && (
          <div
            className={`${bgColor} rounded-full absolute inset-0 flex items-center justify-center text-white font-semibold border border-[#e0e3e5] animate-pulse`}
            style={{ fontSize: size * 0.4 }}
          >
            {getInitials()}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
