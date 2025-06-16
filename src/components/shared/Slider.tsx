import React from 'react';
import SlickSlider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export interface SliderSettings {
  dots?: boolean;
  infinite?: boolean;
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  swipe?: boolean;
  swipeToSlide?: boolean;
  draggable?: boolean;
  accessibility?: boolean;
  touchThreshold?: number;
  touchMove?: boolean;
  useTransform?: boolean;
  waitForAnimate?: boolean;
  useCSS?: boolean;
  centerMode?: boolean;
  centerPadding?: string;
  cssEase?: string;
  responsive?: Array<{
    breakpoint: number;
    settings: Partial<SliderSettings>;
  }>;
  beforeChange?: (current: number, next: number) => void;
  afterChange?: (current: number) => void;
}

export interface SliderProps {
  children: React.ReactNode;
  className?: string;
  settings?: Partial<SliderSettings>;
  onSlideChange?: (isStart: boolean, isEnd: boolean, current: number) => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  totalSlides?: number;
}

const defaultSettings: SliderSettings = {
  dots: true,
  infinite: false,
  speed: 300,
  slidesToShow: 3,
  slidesToScroll: 1,
  swipe: true,
  swipeToSlide: true,
  draggable: true,
  accessibility: true,
  touchThreshold: 5,
  touchMove: true,
  useTransform: true,
  waitForAnimate: false,
  useCSS: true,
  centerMode: false,
  centerPadding: '0px',
  cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        centerMode: false,  /* Disable center mode for left alignment */
        centerPadding: '0px'
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        centerMode: false,  /* Disable center mode for left alignment */
        centerPadding: '0px'
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        centerMode: false,  /* Disable center mode for left alignment */
        centerPadding: '0px'
      }
    }
  ]
};

export const Slider: React.FC<SliderProps> = ({
  children,
  className = '',
  settings = {},
  onSlideChange,
  onDragStart,
  onDragEnd,
  totalSlides = 0
}) => {
  // Calculate proper settings based on content and screen size
  const calculateSlidesToShow = () => {
    const width = window.innerWidth;
    if (width <= 480) return 1;
    if (width <= 768) return Math.min(1, totalSlides);
    if (width <= 1024) return Math.min(2, totalSlides);
    return Math.min(3, totalSlides);
  };

  // Dynamic responsive settings based on total slides - always left-aligned
  const getResponsiveSettings = () => {
    return [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, totalSlides),
          dots: totalSlides > Math.min(2, totalSlides) ? (settings.dots !== false) : false,
          centerMode: false,
          centerPadding: '0px'
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(1, totalSlides),
          dots: totalSlides > Math.min(1, totalSlides) ? (settings.dots !== false) : false,
          centerMode: false,
          centerPadding: '0px'
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          dots: totalSlides > 1 ? (settings.dots !== false) : false,
          centerMode: false,
          centerPadding: '0px'
        }
      }
    ];
  };

  const currentSlidesToShow = Math.min(settings.slidesToShow || 3, totalSlides);
  
  const mergedSettings: SliderSettings = {
    ...defaultSettings,
    ...settings,
    slidesToShow: currentSlidesToShow,
    // Only show dots if we have more slides than what's visible
    dots: totalSlides > currentSlidesToShow ? (settings.dots !== false) : false,
    responsive: getResponsiveSettings(),
    beforeChange: (current: number, next: number) => {
      onDragStart?.();
      settings.beforeChange?.(current, next);
    },
    afterChange: (current: number) => {
      setTimeout(() => onDragEnd?.(), 100);
      
      // Calculate if we're at start/end based on current settings
      const currentSlidesToShow = calculateSlidesToShow();
      const isInfinite = mergedSettings.infinite || false;
      
      let isStart = current === 0;
      let isEnd = false;
      
      if (!isInfinite) {
        isEnd = current >= totalSlides - currentSlidesToShow;
      }
      
      onSlideChange?.(isStart, isEnd, current);
      settings.afterChange?.(current);
    }
  };

  return (
    <SlickSlider {...mergedSettings} className={className}>
      {children}
    </SlickSlider>
  );
};

export default Slider;