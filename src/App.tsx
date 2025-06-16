import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { NavProvider } from './utils/NavContext';
import ScrollToTop from './utils/ScrollToTop';
import { Header, Footer } from './components/layout';
import { ErrorBoundary, Loading } from './components/shared';
import './App.css';

// Lazy load components for code splitting
const Home = lazy(() => import('./components/pages/Home'));
const Blog = lazy(() => import('./components/pages/blog/Blog'));
const BlogPost = lazy(() => import('./components/pages/blog/BlogPost'));

// Loading fallback component
const RouteLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading message="Loading page..." size="large" />
  </div>
);

// Error fallback component
const RouteErrorFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Page Error</h2>
      <p className="text-gray-300 mb-4">There was an error loading this page.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary fallback={RouteErrorFallback}>
      <NavProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white">
          <Header />
          <div className="pt-16"> {/* Offset for fixed header */}
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </NavProvider>
    </ErrorBoundary>
  );
}

export default App;
