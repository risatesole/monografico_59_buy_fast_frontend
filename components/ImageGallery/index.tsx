'use client';

import { useState } from 'react';
import Image from 'next/image';

// ─── Glyph (fallback) ─────────────────────────────────────────

function PlaceholderGlyph() {
  const stroke = 'oklch(0.708 0 0)';
  const props = {
    width: 80,
    height: 80,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 0.75,
  } as const;

  return (
    <svg {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasImages = images.length > 0;
  const selectedImage = hasImages ? images[selectedIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Main image */}
      <div
        style={{
          aspectRatio: '1/1',
          background: 'oklch(0.985 0 0)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid oklch(0.922 0 0)',
        }}
      >
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={`Product image ${selectedIndex + 1}`}
            width={400}
            height={400}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <PlaceholderGlyph />
        )}
      </div>

      {/* Thumbnails — only show if more than one image */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                width: 72,
                height: 72,
                padding: 0,
                border:
                  selectedIndex === index
                    ? '2px solid oklch(0.145 0 0)'
                    : '2px solid oklch(0.922 0 0)',
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'oklch(0.985 0 0)',
                flexShrink: 0,
                transition: 'border-color 0.15s ease',
              }}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                width={72}
                height={72}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
