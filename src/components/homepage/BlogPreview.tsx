import React, { useState, useEffect } from 'react';
import { Slider } from '../shared/Slider';
import { BlogCard } from '../shared/Card';
import { loadAllPosts, type BlogPost } from '../../utils/contentLoader';
import './BlogPreview.css';

const BlogPreview: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await loadAllPosts();
        // Sort posts by date (newest to oldest) and show ALL posts
        const sortedPosts = allPosts.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime(); // Newest first
        });
        setPosts(sortedPosts); // Show all posts, not just first 3
      } catch (err) {
        console.error('Error loading blog posts:', err);
      }
    };

    fetchPosts();
  }, []);

  const handleSlideChange = (isStartSlide: boolean, isEndSlide: boolean, _current: number) => {
    setIsStart(isStartSlide);
    setIsEnd(isEndSlide);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setTimeout(() => setIsDragging(false), 100);
  };

  if (posts.length === 0) return null;

  return (
    <section className="blog-preview-section">
      <h2 className="section-title">Writeups & Guides</h2>

      <div className={`slider-container blog-preview-slider ${isStart ? 'at-start' : ''} ${isEnd ? 'at-end' : ''} ${!isStart && !isEnd ? 'in-middle' : ''}`}>
        <Slider
          className="blog-preview-slider"
          totalSlides={posts.length}
          onSlideChange={handleSlideChange}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {posts.map((post) => (
            <div key={post.slug} className="slider-item">
              <BlogCard
                to={`/blog/${post.slug}`}
                title={post.title}
                date={post.date}
                excerpt={post.excerpt}
                thumbnail={post.thumbnail}
                isDragging={isDragging}
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default React.memo(BlogPreview);
