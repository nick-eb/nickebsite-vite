import React, { useRef, useCallback, useState, useEffect } from 'react';
import './Slider.css';

export interface SliderProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * Native horizontal carousel.
 *
 * The track is a real scroll container so touchpads, mouse wheels and mobile
 * swipes keep browser-native behavior. Desktop mouse drag is additive only and
 * intentionally disabled for touch so vertical page scrolling is never hijacked.
 */
export const Slider: React.FC<SliderProps> = ({ children, className = '', label = 'Carousel' }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const suppressClick = useRef(false);

  const [canScroll, setCanScroll] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const hasOverflow = maxScrollLeft > 1;

    setCanScroll(hasOverflow);
    setCanScrollPrev(hasOverflow && track.scrollLeft > 1);
    setCanScrollNext(hasOverflow && track.scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();

    window.addEventListener('resize', updateScrollState);
    track.addEventListener('scroll', updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(track);

    return () => {
      window.removeEventListener('resize', updateScrollState);
      track.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [children, updateScrollState]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({
      left: direction * track.clientWidth * 0.85,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !canScroll) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByPage(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByPage(1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      track.scrollTo({ left: 0, behavior });
    } else if (e.key === 'End') {
      e.preventDefault();
      track.scrollTo({ left: track.scrollWidth, behavior });
    }
  }, [canScroll, scrollByPage]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !canScroll) return;

    // Let touch devices use native scrolling so horizontal swipes do not fight
    // vertical page scroll. Mouse drag is just a desktop convenience.
    if (e.pointerType !== 'mouse' || e.button !== 0) return;

    isPointerDown.current = true;
    isDragging.current = false;
    suppressClick.current = false;
    startX.current = e.clientX;
    scrollStart.current = track.scrollLeft;
  }, [canScroll]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!isPointerDown.current || !track) return;

    const dx = e.clientX - startX.current;

    if (!isDragging.current) {
      if (Math.abs(dx) < 8) return;

      isDragging.current = true;
      suppressClick.current = true;
      track.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging');
      track.style.scrollBehavior = 'auto';
    }

    e.preventDefault();
    track.scrollLeft = scrollStart.current - dx;
  }, []);

  const finishDrag = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;

    isPointerDown.current = false;

    if (isDragging.current) {
      isDragging.current = false;
      if (track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
      track.classList.remove('is-dragging');
      track.style.scrollBehavior = '';

      window.setTimeout(() => {
        suppressClick.current = false;
      }, 100);
    }
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <div className={`carousel ${className}`} aria-label={label}>
      {canScroll && (
        <div className="carousel-controls" aria-hidden={false}>
          <button
            type="button"
            className="carousel-button carousel-button-prev"
            aria-label="Scroll carousel left"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollPrev}
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-button carousel-button-next"
            aria-label="Scroll carousel right"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollNext}
          >
            ›
          </button>
        </div>
      )}

      <div
        ref={trackRef}
        className={`carousel-track ${canScroll ? 'can-scroll' : 'centered'}`}
        tabIndex={canScroll ? 0 : -1}
        role="region"
        aria-label={`${label} items`}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </div>
  );
};

export default Slider;
