import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadBlogPost } from '../../utils/markdownLoader';
import { useSlideshow, SlideData } from '../../hooks/useSlideshow';
import './BlogPost.css';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<{ title: string; date: string; content: string; } | null>(null);
  const [loading, setLoading] = useState(true);
  const processedRef = useRef(false);

  const {
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
    syncCarouselPosition,
    carouselStates,
  } = useSlideshow();

  const handleFullscreenSlideChange = useCallback((direction: number) => {
    goToSlide(currentSlide + direction);
  }, [currentSlide, goToSlide]);

  // Fix type issues in extractSlides
  const extractSlides = useCallback(() => {
    if (!contentRef.current || processedRef.current) return;
    
    const carousels = contentRef.current.getElementsByClassName('image-carousel');
    const extractedSlides: SlideData[] = [];

    Array.from(carousels).forEach((carousel, carouselIndex) => {
      const carouselSlides = carousel.getElementsByClassName('carousel-slide');
      Array.from(carouselSlides).forEach((slide) => {
        const img = slide.querySelector('img') as HTMLImageElement | null;
        if (img) {
          extractedSlides.push({
            src: img.src,
            caption: img.title || img.alt || '',
            alt: img.alt || '',
            group: `carousel-${carouselIndex}`,
          });
        }
      });
    });

    const standaloneImages = contentRef.current.querySelectorAll('img');
    standaloneImages.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      extractedSlides.push({
        src: imgElement.src,
        caption: imgElement.title || imgElement.alt || '',
        alt: imgElement.alt || '',
      });
    });

    setSlides(extractedSlides);
    processedRef.current = true;
  }, [setSlides]);

  const processCarousels = useCallback(() => {
    if (!contentRef.current || !slides.length) return;

    const carousels = contentRef.current.getElementsByClassName('image-carousel');
    const cleanupFunctions: (() => void)[] = [];

    Array.from(carousels).forEach((carousel, carouselIndex) => {
      const carouselId = `carousel-${carouselIndex}`;
      const slideElements = carousel.getElementsByClassName('carousel-slide');
      const prevButton = carousel.querySelector('.carousel-button.prev') as HTMLButtonElement;
      const nextButton = carousel.querySelector('.carousel-button.next') as HTMLButtonElement;
      const caption = carousel.querySelector('.image-caption');

      if (!slideElements.length || !prevButton || !nextButton || !caption) return;

      const showSlide = (index: number) => {
        const newIndex = ((index % slideElements.length) + slideElements.length) % slideElements.length;
        Array.from(slideElements).forEach((slide, i) => {
          slide.classList.toggle('active', i === newIndex);
        });

        const img = slideElements[newIndex].querySelector('img') as HTMLImageElement;
        if (img) {
          caption.textContent = img.title || img.alt || '';
          const globalIndex = slides.findIndex(s => s.src === img.src);
          if (globalIndex !== -1) {
            updateCarouselState(carouselId, newIndex);
            if (fullscreenImage) {
              goToSlide(globalIndex);
            }
          }
        }
      };

      const handlePrevClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const currentIndex = Array.from(slideElements).findIndex(slide => 
          slide.classList.contains('active')
        );
        showSlide(currentIndex - 1);
      };

      const handleNextClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const currentIndex = Array.from(slideElements).findIndex(slide => 
          slide.classList.contains('active')
        );
        showSlide(currentIndex + 1);
      };

      prevButton.addEventListener('click', handlePrevClick);
      nextButton.addEventListener('click', handleNextClick);

      cleanupFunctions.push(() => {
        prevButton.removeEventListener('click', handlePrevClick);
        nextButton.removeEventListener('click', handleNextClick);
      });

      showSlide(0);
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [slides, updateCarouselState, fullscreenImage, goToSlide]);

  // Update image handlers with proper cleanup
  useEffect(() => {
    if (!contentRef.current || !slides.length) return;

    const images = contentRef.current.getElementsByTagName('img');
    const cleanupFunctions: (() => void)[] = [];

    Array.from(images).forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      imgElement.style.cursor = 'pointer';
      
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openFullscreen(imgElement.src);
      };

      imgElement.addEventListener('click', handleClick);
      cleanupFunctions.push(() => {
        imgElement.removeEventListener('click', handleClick);
      });
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [slides.length, openFullscreen, fullscreenImage]);

  // Load post
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const postData = await loadBlogPost(slug);
        if (!postData) {
          navigate('/blog');
          return;
        }
        setPost(postData);
      } catch (error) {
        console.error('Error loading blog post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  // Initialize carousel with cleanup
  useEffect(() => {
    if (post && contentRef.current) {
      extractSlides();
      const cleanup = processCarousels();
      return cleanup;
    }
  }, [post, extractSlides, processCarousels, fullscreenImage]);

  if (loading) {
    return (
      <div className="blog-post-section">
        <div className="content-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <motion.article 
      className="blog-post-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="content-container">
        <div className="blog-post-header">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {post.title}
          </motion.h1>
          <motion.time
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {new Date(post.date).toLocaleDateString()}
          </motion.time>
        </div>

        <motion.div 
          ref={contentRef}
          className="blog-post-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <motion.div 
          className="blog-post-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button 
            onClick={() => navigate('/blog')}
            className="back-button"
          >
            ← Back to Blog
          </button>
        </motion.div>
      </div>

      {fullscreenImage && (
        <motion.div 
          className="fullscreen-overlay"
          onClick={closeFullscreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="fullscreen-overlay"
        >
          <motion.div 
            className="fullscreen-image-container" 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <button 
              className="exit-fullscreen"
              onClick={closeFullscreen}
              aria-label="Exit fullscreen"
            >
              ×
            </button>
            <img 
              src={slides[currentSlide]?.src || fullscreenImage}
              alt={slides[currentSlide]?.alt || 'Fullscreen view'}
              className="fullscreen-image"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={e => e.stopPropagation()}
            />
            <div className="fullscreen-controls">
              <span className="image-caption">
                {slides[currentSlide]?.caption}
              </span>
              <div className="carousel-buttons">
                <button 
                  className="carousel-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullscreenSlideChange(-1);
                  }}
                >
                  ←
                </button>
                <button 
                  className="carousel-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullscreenSlideChange(1);
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.article>
  );
};

export default BlogPost;
