import React, { useRef, useCallback, useState, useEffect } from 'react';
import './Slider.css';

export interface SliderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A simple, bulletproof horizontal carousel slider.
 * - Uses native horizontal scrolling
 * - Supports click-and-drag on desktop
 * - Shows a styled scrollbar for easy navigation
 * - Works on touch devices natively
 * - Centers content if it all fits without scrolling
 */
export const Slider: React.FC<SliderProps> = ({ children, className = '' }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged = useRef(false);

  // Track whether content overflows (needs scrolling)
  const [canScroll, setCanScroll] = useState(false);

  // Check if content overflows on mount and resize
  useEffect(() => {
    const checkOverflow = () => {
      const track = trackRef.current;
      if (!track) return;

      // Content overflows if scrollWidth > clientWidth
      const hasOverflow = track.scrollWidth > track.clientWidth;
      setCanScroll(hasOverflow);
    };

    // Check initially
    checkOverflow();

    // Re-check on window resize
    window.addEventListener('resize', checkOverflow);

    // Also use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkOverflow);
      resizeObserver.disconnect();
    };
  }, [children]); // Re-run when children change

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !canScroll) return; // Don't enable drag if no scrolling needed

    // Only handle left mouse button or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    scrollStart.current = track.scrollLeft;

    // Capture pointer to receive events even when pointer leaves element
    track.setPointerCapture(e.pointerId);
    track.style.cursor = 'grabbing';
    track.style.scrollBehavior = 'auto'; // Instant feedback while dragging
  }, [canScroll]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;

    const dx = e.clientX - startX.current;

    // Mark as dragged if moved more than 5px (prevents accidental navigation)
    if (Math.abs(dx) > 5) {
      hasDragged.current = true;
    }

    trackRef.current.scrollLeft = scrollStart.current - dx;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;

    isDragging.current = false;
    track.releasePointerCapture(e.pointerId);
    track.style.cursor = canScroll ? 'grab' : 'default';
    track.style.scrollBehavior = 'smooth'; // Restore smooth scrolling

    // Keep hasDragged true for a short time to block the click event
    // The click event fires after pointerup, so we need this delay
    setTimeout(() => {
      hasDragged.current = false;
    }, 100);
  }, [canScroll]);

  // Prevent click navigation if we just finished dragging
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <div className={`carousel ${className}`}>
      <div
        ref={trackRef}
        className={`carousel-track ${canScroll ? 'can-scroll' : 'centered'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </div>
  );
};

export default Slider;