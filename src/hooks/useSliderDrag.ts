import { useRef, useCallback, useEffect } from 'react';

interface UseSliderDragOptions {
  enabled?: boolean;
  smoothScrolling?: boolean;
  scrollMultiplier?: number;
}

export const useSliderDrag = (options: UseSliderDragOptions = {}) => {
  const {
    enabled = true,
    smoothScrolling = true,
    scrollMultiplier = 1.2
  } = options;

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastScrollLeft = useRef(0);

  const scrollSlider = useCallback((deltaX: number) => {
    if (!enabled || !sliderRef.current) return;

    const slider = sliderRef.current;
    const slickList = slider.querySelector('.slick-list') as HTMLElement;
    
    if (!slickList) return;

    // Calculate new scroll position
    const currentScroll = slickList.scrollLeft;
    const newScroll = currentScroll - (deltaX * scrollMultiplier);
    
    // Apply scroll
    if (smoothScrolling) {
      slickList.style.scrollBehavior = 'smooth';
      slickList.scrollLeft = newScroll;
      // Reset scroll behavior after a short delay
      setTimeout(() => {
        if (slickList) {
          slickList.style.scrollBehavior = '';
        }
      }, 150);
    } else {
      slickList.style.scrollBehavior = '';
      slickList.scrollLeft = newScroll;
    }

    lastScrollLeft.current = newScroll;
  }, [enabled, scrollMultiplier, smoothScrolling]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    
    if (sliderRef.current) {
      const slickList = sliderRef.current.querySelector('.slick-list') as HTMLElement;
      if (slickList) {
        lastScrollLeft.current = slickList.scrollLeft;
        // Disable smooth scrolling during drag for better performance
        slickList.style.scrollBehavior = '';
      }
    }
  }, []);

  const handleDrag = useCallback((deltaX: number) => {
    if (!isDraggingRef.current || !enabled) return;
    
    scrollSlider(deltaX);
  }, [scrollSlider, enabled]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    
    if (sliderRef.current && smoothScrolling) {
      const slickList = sliderRef.current.querySelector('.slick-list') as HTMLElement;
      if (slickList) {
        // Re-enable smooth scrolling after drag ends
        setTimeout(() => {
          if (slickList) {
            slickList.style.scrollBehavior = 'smooth';
          }
        }, 50);
      }
    }
  }, [smoothScrolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
    };
  }, []);

  return {
    sliderRef,
    scrollSlider,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    isDragging: isDraggingRef.current
  };
};