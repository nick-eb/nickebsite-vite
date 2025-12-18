import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MDXProvider } from '@mdx-js/react';
import { getPostBySlug, type BlogPost } from '../../../utils/contentLoader';
import { mdxComponents } from '../../mdx/MDXComponents';
import { Loading } from '../../shared';
import './BlogPost.css';
import '../../mdx/MDXComponents.css';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the blog post
  useEffect(() => {
    if (!slug) return;

    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Loading post with slug: ${slug}`);

        const blogPost = await getPostBySlug(slug);
        console.log('Loaded post:', blogPost);

        if (!blogPost) {
          setError('Post not found');
          return;
        }

        setPost(blogPost);
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const handleBack = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <div className="blog-post-section">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <Loading message="Loading blog post..." size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-section">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="text-xl text-red-400 mb-4">
              {error || 'Post not found'}
            </div>
            <button onClick={handleBack} className="back-button">
              ← Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      className="blog-post-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <motion.article
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="blog-post-header">
            <h1>{post.title}</h1>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>

          {/* Content */}
          <div className="blog-post-content">
            {post.type === 'md' ? (
              // Render Markdown content
              <div dangerouslySetInnerHTML={{ __html: post.content as string }} />
            ) : (
              // Render MDX content
              <MDXProvider components={mdxComponents}>
                <div className="mdx-wrapper">
                  {(() => {
                    try {
                      const Content = post.content as React.ComponentType;
                      console.log('Rendering MDX content:', Content);

                      // Ensure Content is a valid React component
                      if (typeof Content !== 'function') {
                        throw new Error('MDX content is not a valid React component');
                      }

                      return <Content />;
                    } catch (err) {
                      console.error('Error rendering MDX content:', err);
                      return (
                        <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
                          <h3>MDX Rendering Error</h3>
                          <p>There was an error rendering this MDX content.</p>
                          <details>
                            <summary>Error Details</summary>
                            <pre>{err instanceof Error ? err.message : String(err)}</pre>
                          </details>
                          <p>Post title: {post.title}</p>
                          <p>Post type: {post.type}</p>
                          <p>Content type: {typeof post.content}</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </MDXProvider>
            )}
          </div>

          {/* Back Button */}
          <button onClick={handleBack} className="back-button">
            ← Back to Blog
          </button>
        </motion.article>
      </div>
    </motion.section>
  );
}
