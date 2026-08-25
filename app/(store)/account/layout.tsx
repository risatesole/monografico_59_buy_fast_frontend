'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const SECTIONS = [
  { id: 'account', label: 'Cuenta', href: '/account/account' },
  { id: 'orders', label: 'Órdenes', href: '/account/orders' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  // Get current page label
  const currentPage = SECTIONS.find(s => s.href === pathname)?.label || 'Account';

  return (
    <div style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: isMobile ? '2rem 1rem 4rem' : '4rem 2rem 6rem',
        }}
      >
        <h1
          style={{
            fontFamily: "'Georgia', serif",
            fontWeight: 400,
            fontSize: isMobile ? '1.25rem' : '1.65rem',
            marginBottom: isMobile ? '0.25rem' : '0.5rem',
            color: '#002d62',
          }}
        >
          Cuenta
        </h1>
        <p
          style={{
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            color: '#43474f',
            marginBottom: isMobile ? '1.5rem' : '3rem',
          }}
        >
          Administra tu perfil, seguridad y preferencias.
        </p>

        {!isMobile ? (
          // Desktop layout with sidebar
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr',
              gap: '3rem',
              alignItems: 'start',
            }}
          >
            <nav
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                width: '100%',
              }}
            >
              {SECTIONS.map(s => {
                const isActive = pathname === s.href;
                return (
                  <Link
                    key={s.id}
                    href={s.href}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#002d62' : '#43474f',
                      background: isActive ? '#f2f4f6' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #115cb9' : '3px solid transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      transition: 'all 0.15s',
                      textDecoration: 'none',
                    }}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </nav>
            <div
              style={{
                borderTop: '1px solid oklch(0.922 0 0)',
                paddingTop: '1.5rem',
                minHeight: 400,
              }}
            >
              {children}
            </div>
          </div>
        ) : (
          // Mobile layout with topbar dropdown
          <>
            {/* Mobile Topbar */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'white',
                borderBottom: '1px solid oklch(0.922 0 0)',
                marginBottom: '1.5rem',
                paddingBottom: '0.5rem',
              }}
            >
              <button
                onClick={toggle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'oklch(0.985 0 0)',
                  border: '1px solid oklch(0.922 0 0)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '0.875rem',
                  color: 'oklch(0.145 0 0)',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontWeight: 500 }}>{currentPage}</span>
                <span
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.3s',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid oklch(0.922 0 0)',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    marginTop: '1px',
                  }}
                >
                  {SECTIONS.map(s => {
                    const isActive = pathname === s.href;
                    return (
                      <Link
                        key={s.id}
                        href={s.href}
                        onClick={close}
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 500 : 400,
                          color: isActive ? 'oklch(0.145 0 0)' : 'oklch(0.556 0 0)',
                          background: isActive ? 'oklch(0.97 0 0)' : 'transparent',
                          borderLeft: isActive
                            ? '3px solid oklch(0.145 0 0)'
                            : '3px solid transparent',
                          textDecoration: 'none',
                          transition: 'all 0.15s',
                          fontFamily: 'var(--font-geist-sans), sans-serif',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'oklch(0.97 0 0)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {s.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Content */}
            <div
              style={{
                borderTop: '1px solid oklch(0.922 0 0)',
                paddingTop: '1.5rem',
                minHeight: 400,
              }}
            >
              {children}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
