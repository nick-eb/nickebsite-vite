import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { loadBlogPosts, type BlogPost } from '../../utils/markdownLoader';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './BlogPreview.css';
import '../../styles/CardStyles.css';

const DEFAULT_THUMBNAIL = '/assets/img/logo.png';

const BlogPreview = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);  // Add this state

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 300,               // Faster transition
    slidesToShow: 3,
    slidesToScroll: 1,        // Always scroll one at a time
    swipe: true,
    swipeToSlide: false,      // Disable free-form swiping
    draggable: true,
    accessibility: true,
    touchThreshold: 5,        // Make touch less sensitive
    touchMove: true,
    useTransform: true,
    waitForAnimate: true,     // Wait for animation to finish
    useCSS: true,
    centerMode: true,
    centerPadding: '0',
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Custom easing for snappier feel
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: false
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5,
          centerMode: false,
          centerPadding: '0'
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          centerPadding: '0'
        }
      }
    ],
    beforeChange: (_: number, newIndex: number) => {
      setIsDragging(true);  // Set dragging to true when slide changes
      setIsStart(newIndex === 0);
    },
    afterChange: (current: number) => {
      setTimeout(() => setIsDragging(false), 100);  // Reset dragging state after a small delay
      const totalSlides = posts.length;
      const slidesToShow = window.innerWidth <= 768 ? 2 : 3;
      setIsEnd(current >= totalSlides - slidesToShow);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await loadBlogPosts();
        const sortedPosts = allPosts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setPosts(sortedPosts);
      } catch (err) {
        console.error('Error loading blog posts:', err);
      }
    };

    fetchPosts();
  }, []);

  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/blog');
  };

  if (posts.length === 0) return null;

  return (
    <section className="blog-preview-section">
      <h2 className="section-title">Writeups & Guides</h2>

      <div className={`slider-container ${isStart ? 'at-start' : ''} ${isEnd ? 'at-end' : ''} ${!isStart && !isEnd ? 'in-middle' : ''}`}>
        <Slider {...sliderSettings} className="blog-preview-slider">
          {posts.map((post) => (
            <div key={post.slug} className="slider-item">
              <Link 
                to={`/blog/${post.slug}`} 
                className="card"
                draggable="false"
                onClick={(e) => {
                  if (isDragging) {  // Check dragging state before navigating
                    e.preventDefault();
                    return;
                  }
                }}
              >
                <div className="card-image">
                  <img 
                    src={post.thumbnail || DEFAULT_THUMBNAIL}
                    alt={`${post.title} thumbnail`}
                    loading="lazy"
                    draggable="false"
                  />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{post.title}</h3>
                  <time className="blog-date">
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                  <p className="card-description">{post.excerpt}</p>
                  <div className="read-more">Read more →</div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
        
        <Link to="/blog" className="view-all-link" onClick={handleViewAll}>
          View all posts →
        </Link>
      </div>
    </section>
  );
};

export default BlogPreview;
