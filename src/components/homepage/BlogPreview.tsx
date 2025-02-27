import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { loadBlogPosts, type BlogPost } from '../../utils/markdownLoader';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './BlogPreview.css';

const DEFAULT_THUMBNAIL = '/assets/img/logo.png';

const BlogPreview = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    touchThreshold: 10,
    useCSS: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          arrows: true,
          dots: true
        }
      }
    ],
    beforeChange: (_oldIndex: number, newIndex: number) => {
      setIsStart(newIndex === 0);
    },
    afterChange: (current: number) => {
      const totalSlides = posts.length;
      const slidesToShow = window.innerWidth <= 768 ? 2 : 3;
      setIsEnd(current >= totalSlides - slidesToShow);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await loadBlogPosts();
        // Sort posts by date and get 3 most recent
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
      <div className="content-container">
        <h2 className="section-title">Writeups & Guides</h2>

        <div className={`slider-container ${isStart ? 'at-start' : ''} ${isEnd ? 'at-end' : ''} ${!isStart && !isEnd ? 'in-middle' : ''}`}>
          <Slider {...sliderSettings} className="blog-preview-slider">
            {posts.map((post, i) => (
              <div key={post.slug} className="slider-item">
                <motion.article 
                  className="blog-preview-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">
                    <div className="blog-image">
                      <img 
                        src={post.thumbnail || DEFAULT_THUMBNAIL}
                        alt={`${post.title} thumbnail`}
                        loading="lazy"
                      />
                    </div>
                    <div className="blog-card-content">
                      <h3 className="blog-title">{post.title}</h3>
                      <time className="blog-date">
                        {new Date(post.date).toLocaleDateString()}
                      </time>
                      <p className="blog-excerpt">{post.excerpt}</p>
                      <span className="read-more">Read more →</span>
                    </div>
                  </Link>
                </motion.article>
              </div>
            ))}
          </Slider>
          
          <Link to="/blog" className="view-all-link" onClick={handleViewAll}>
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
