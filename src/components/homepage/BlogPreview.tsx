import React, { useState, useEffect } from 'react';
import { Slider } from '../shared/Slider';
import { BlogCard } from '../shared/Card';
import { loadAllPosts, type BlogPost } from '../../utils/contentLoader';
import { useSliderDrag } from '../../hooks/useSliderDrag';
import './BlogPreview.css';

const BlogPreview: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Initialize slider drag functionality
  const {
    sliderRef,
    handleDragStart: sliderDragStart,
    handleDrag: sliderDrag,
    handleDragEnd: sliderDragEnd
  } = useSliderDrag({
    enabled: true,
    smoothScrolling: true,
    scrollMultiplier: 1.2
  });

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
    // Drag start handled by card interaction
  };

  const handleDragEnd = () => {
    // Drag end handled by card interaction
  };

  if (posts.length === 0) return null;

  return (
    <section className="blog-preview-section">
      <h2 className="section-title">Writeups & Guides</h2>

      <div
        ref={sliderRef}
        className={`slider-container blog-preview-slider ${isStart ? 'at-start' : ''} ${isEnd ? 'at-end' : ''} ${!isStart && !isEnd ? 'in-middle' : ''}`}
      >
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
                onDragStart={sliderDragStart}
                onDrag={sliderDrag}
                onDragEnd={sliderDragEnd}
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default React.memo(BlogPreview);
