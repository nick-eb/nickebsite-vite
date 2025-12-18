import React, { useState, useEffect } from 'react';
import { Slider } from '../shared/Slider';
import { BlogCard } from '../shared/Card';
import { loadAllPosts, type BlogPost } from '../../utils/contentLoader';
import './BlogPreview.css';

const BlogPreview: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

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

  if (posts.length === 0) return null;

  return (
    <section className="blog-preview-section">
      <h2 className="section-title">Writeups & Guides</h2>

      <Slider className="blog-preview-slider">
        {posts.map((post) => (
          <div key={post.slug} className="slider-item">
            <BlogCard
              to={`/blog/${post.slug}`}
              title={post.title}
              date={post.date}
              excerpt={post.excerpt}
              thumbnail={post.thumbnail}
            />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default React.memo(BlogPreview);
