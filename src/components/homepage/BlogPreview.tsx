import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { loadBlogPosts, type BlogPost } from '../../utils/markdownLoader';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './BlogPreview.css';

const BlogPreview = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const sliderSettings = {
    dots: true,
    infinite: false,  // Disable infinite loop
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,  // Change to 1 for smoother navigation
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }
    ]
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

  if (posts.length === 0) return null;

  return (
    <section className="blog-preview-section">
      <div className="content-container">
        <Link to="/blog" className="blog-preview-header">
          <h2 className="section-title">
            Writeups, IRL Projects & More
            <span className="view-all">View all posts →</span>
          </h2>
        </Link>

        <Slider {...sliderSettings} className="blog-preview-slider">
          {posts.map((post, i) => (
            <div key={post.slug} className="slider-item">
              <motion.article 
                className="blog-preview-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`} className="blog-preview-link">
                  <h3 className="blog-preview-title">{post.title}</h3>
                  <time className="blog-preview-date">
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                  <p className="blog-preview-excerpt">{post.excerpt}</p>
                </Link>
              </motion.article>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default BlogPreview;
