import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadBlogPost } from '../../utils/markdownLoader';
import './BlogPost.css';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<{
    title: string;
    date: string;
    content: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
    </motion.article>
  );
};

export default BlogPost;
