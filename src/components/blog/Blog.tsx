import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadBlogPosts, type BlogPost } from '../../utils/markdownLoader';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await loadBlogPosts();
        // Sort posts by date, most recent first
        const sortedPosts = allPosts.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPosts(sortedPosts);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="blog-section">
        <div className="content-container">
          <div className="loading">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-section">
        <div className="content-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="home-container">
      <div className="content-wrapper">
        <section className="blog-section">
          <div className="content-container">
            <div className="blog-header">
              <h1 className="section-title">
                Blog
                <div className="section-title-bar"></div>
              </h1>
            </div>

            {posts.length === 0 ? (
              <p className="text-center text-gray-400">No blog posts found.</p>
            ) : (
              <div className="blog-grid">
                {posts.map((post, i) => (
                  <article 
                    key={post.slug}
                    className="blog-card"
                  >
                    <Link to={`/blog/${post.slug}`} className="blog-card-link">
                      <div className="blog-card-content">
                        <h2 className="blog-title">{post.title}</h2>
                        <time className="blog-date">
                          {new Date(post.date).toLocaleDateString()}
                        </time>
                        <p className="blog-excerpt">{post.excerpt}</p>
                        <span className="read-more">Read more →</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            <button 
              onClick={() => navigate('/')}
              className="back-button"
            >
              ← Back to Home
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Blog;
