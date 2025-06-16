import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadAllPosts, type BlogPost } from '../../../utils/contentLoader';
import { Loading } from '../../shared';
import './Blog.css';
import '../../homepage/BlogPreview.css';  // Import BlogPreview styles

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await loadAllPosts();
        // Posts are already sorted by date in the loader
        setPosts(allPosts);
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
          <Loading message="Loading posts..." />
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
              <div className="blog-grid blog-preview-slider">
                {posts.map(post => (
                  <div key={post.slug} className="card">
                    <Link to={`/blog/${post.slug}`} className="card-link">
                      <div className="card-image">
                        <img 
                          src={post.thumbnail || '/logo.png'} 
                          alt={post.title}
                        />
                      </div>
                      <div className="card-content">
                        <h2 className="card-title">{post.title}</h2>
                        <time className="blog-date">
                          {new Date(post.date).toLocaleDateString()}
                        </time>
                        <p className="card-description">{post.excerpt}</p>
                        <div className="read-more">Read more →</div>
                      </div>
                    </Link>
                  </div>
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
