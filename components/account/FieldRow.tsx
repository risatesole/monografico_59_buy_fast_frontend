'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '0.5rem' : '1rem',
        paddingBlock: '1.25rem',
        borderBottom: '1px solid #e0e3e5',
        alignItems: 'start',
      }}
    >
      <div>
        <p
          style={{
            fontSize: isMobile ? '0.8125rem' : '0.875rem',
            fontWeight: 500,
            marginBottom: hint ? '0.25rem' : 0,
          }}
        >
          {label}
        </p>
        {hint && (
          <p
            style={{
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              color: '#747781',
              lineHeight: 1.5,
            }}
          >
            {hint}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
