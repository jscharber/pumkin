'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/inspiration', label: 'Inspiration Gallery' },
  { href: '/submit', label: 'Submit Entry' },
  { href: '/vote', label: 'Vote' },
  { href: '/results', label: 'Results' },
  { href: '/admin', label: 'Admin' },
];

// Gap between links and the width reserved for the menu button, in px
const GAP = 16;
const MENU_BUTTON_WIDTH = 44;

// useLayoutEffect warns during server rendering; measure before paint on the client only
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Shows as many links as fit on one line and moves the rest into a menu
export default function NavLinks() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(LINKS.length);
  const [menuOpen, setMenuOpen] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      const widths = Array.from(measure.children).map(
        (el) => (el as HTMLElement).offsetWidth
      );
      const available = container.clientWidth;
      const total = widths.reduce((sum, w) => sum + w, 0) + GAP * (widths.length - 1);

      if (total <= available) {
        setVisibleCount(LINKS.length);
        return;
      }

      // Not everything fits: keep room for the menu button
      let used = MENU_BUTTON_WIDTH;
      let count = 0;
      for (const width of widths) {
        const next = used + width + GAP;
        if (next > available) break;
        used = next;
        count++;
      }
      setVisibleCount(count);
    };

    update();
    // Re-measure on resize and when web fonts change link widths
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(measure);
    return () => observer.disconnect();
  }, []);

  // Close the menu when navigating, clicking outside, or pressing Escape
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const visibleLinks = LINKS.slice(0, visibleCount);
  const overflowLinks = LINKS.slice(visibleCount);
  const linkClass = (href: string) =>
    `whitespace-nowrap hover:text-accent transition-colors ${
      pathname === href ? 'underline underline-offset-4 decoration-2' : ''
    }`;

  return (
    <div
      ref={containerRef}
      className="relative w-full sm:w-auto sm:flex-1 min-w-0 text-sm sm:text-base"
    >
      {/* Hidden copy of every link, used only to measure widths; clipped so it can't widen the page */}
      <div className="absolute inset-x-0 top-0 h-0 overflow-hidden" aria-hidden="true">
        <div
          ref={measureRef}
          className="invisible inline-flex whitespace-nowrap pointer-events-none"
          style={{ gap: GAP }}
        >
          {LINKS.map((link) => (
            <span key={link.href}>{link.label}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center sm:justify-end" style={{ gap: GAP }}>
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(link.href)}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}

        {overflowLinks.length > 0 && (
          <div ref={menuRef} className="relative ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center justify-center w-9 h-9 -my-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="More pages"
              aria-expanded={menuOpen}
              aria-controls="nav-overflow-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {menuOpen && (
              <div
                id="nav-overflow-menu"
                className="absolute right-0 top-full mt-2 min-w-[10rem] py-2 bg-white text-gray-800 rounded-lg shadow-xl z-50"
              >
                {overflowLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-2 hover:bg-orange-50 ${
                      pathname === link.href ? 'font-semibold text-primary' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
