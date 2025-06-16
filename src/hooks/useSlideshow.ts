import { useState, useCallback, useEffect, useRef } from 'react';

export interface SlideData {
  src: string;
  caption: string;
  alt: string;
  group?: string;
}

interface CarouselState {
  currentIndex: number;
  slides: SlideData[];
}

export function useSlideshow() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const carouselStates = useRef<Record<string, CarouselState>>({});
  const touchStartX = useRef<number>(0);

  const updateCarouselState = useCallback((groupId: string, index: number) => {
    if (!carouselStates.current[groupId]) {
      carouselStates.current[groupId] = {
        currentIndex: 0,
        slides: slides.filter(slide => slide.group === groupId)
      };
    }
    carouselStates.current[groupId].currentIndex = index;
  }, [slides]);

  const getCarouselBySlideIndex = useCallback((index: number) => {
    const slide = slides[index];
    if (!slide?.group) return null;
    return {
      id: slide.group,
      slides: slides.filter(s => s.group === slide.group),
      index: slides.filter(s => s.group === slide.group)
        .findIndex(s => s.src === slide.src)
    };
  }, [slides]);

  const syncAllCarousels = useCallback((globalIndex: number) => {
    const slide = slides[globalIndex];
    if (slide?.group) {
      const groupSlides = slides.filter(s => s.group === slide.group);
      const groupIndex = groupSlides.findIndex(s => s.src === slide.src);
      updateCarouselState(slide.group, groupIndex);
    }
  }, [slides, updateCarouselState]);

  const goToSlide = useCallback((index: number) => {
    if (slides.length === 0) return;
    const newIndex = ((index % slides.length) + slides.length) % slides.length;
    setCurrentSlide(newIndex);
    syncAllCarousels(newIndex);
  }, [slides.length, syncAllCarousels]);

  const openFullscreen = useCallback((src: string) => {
    const index = slides.findIndex(slide => slide.src === src);
    if (index !== -1) {
      const slide = slides[index];
      if (slide && slide.group) {
        // Find the relative index within the group
        const groupSlides = slides.filter(s => s.group === slide.group);
        const groupIndex = groupSlides.findIndex(s => s.src === src);
        updateCarouselState(slide.group, groupIndex);
      }
      setCurrentSlide(index);
      setFullscreenImage(src);
      document.body.style.overflow = 'hidden';
    }
  }, [slides, updateCarouselState]);

  const closeFullscreen = useCallback(() => {
    setFullscreenImage(null);
    document.body.style.overflow = '';
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;
      
      if (Math.abs(diff) > 50) {
        goToSlide(currentSlide + (diff > 0 ? 1 : -1));
      }
    }
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImage) {
        if (e.key === 'Escape') closeFullscreen();
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, goToSlide, fullscreenImage, closeFullscreen]);

  const syncCarouselPosition = useCallback((carouselId: string, index: number) => {
    const groupSlides = slides.filter(slide => slide.group === carouselId);
    const targetSlide = groupSlides[index];
    if (targetSlide) {
      const globalIndex = slides.findIndex(slide => slide.src === targetSlide.src);
      goToSlide(globalIndex);
    }
  }, [slides, goToSlide]);

  return {
    currentSlide,
    fullscreenImage,
    slides,
    setSlides,
    goToSlide,
    openFullscreen,
    closeFullscreen,
    handleTouchStart,
    handleTouchEnd,
    updateCarouselState,
    carouselStates: carouselStates.current,
    syncCarouselPosition,
    getCarouselBySlideIndex,
    syncAllCarousels,
  };
}
