'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Slide = {
  id: string | number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

const MAX_WAIT_MS = 8000; // don't block forever if an image stalls/fails

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const total = slides?.length ?? 0;

  const [loadedCount, setLoadedCount] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // Derived, not synced via effect: ready the moment every image has
  // settled (loaded or errored), or once the safety timer fires.
  const ready = total === 0 || loadedCount >= total || timedOut;

  function handleImageSettled() {
    setLoadedCount(c => c + 1);
  }

  // Safety net: reveal anyway if images take too long. The setState call
  // lives inside the timer callback (an external system), not the effect
  // body itself, so this doesn't trigger cascading renders.
  useEffect(() => {
    if (total === 0) return;
    const timer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, [total]);

  function goTo(index: number) {
    if (!slides?.length) return;
    setActive(((index % slides.length) + slides.length) % slides.length);
  }

  // Autoplay — functional update avoids needing `active` as a dependency
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <>
      {/* Blocks the whole viewport (and everything under it) until images are ready */}
      {!ready && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#002d62]" />
          <p className="text-sm font-medium tracking-wide text-[#747781]">Cargando…</p>
        </div>
      )}

      <div className="relative h-[360px] w-full overflow-hidden sm:h-[440px] lg:h-[520px]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === active ? 'z-10 opacity-100' : 'z-0 opacity-0'
            }`}
            aria-hidden={i !== active}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              unoptimized
              priority={i === 0}
              className="object-cover"
              onLoad={handleImageSettled}
              onError={handleImageSettled}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#002d62]/80 via-[#002d62]/30 to-transparent" />

            <div className="relative z-10 flex h-full max-w-7xl flex-col items-start justify-center px-6 mx-auto sm:px-10">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-5xl">
                {slide.title}
              </h2>
              <p className="mt-3 max-w-md text-base text-white/90 sm:text-lg">
                {slide.description}
              </p>
              <Link
                href={`/${slide.buttonLink}`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold tracking-wide text-[#002d62] shadow-sm transition-all duration-200 hover:bg-[#f7f9fb] active:scale-95"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
                aria-current={i === active}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Prev / Next controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Siguiente slide"
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </>
  );
}
