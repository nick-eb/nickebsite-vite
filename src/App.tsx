import { Routes, Route, useLocation } from 'react-router-dom';
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
const ZenithHome = lazy(() => import('./components/pages/zenith/ZenithHome'));
const ZenithPrivacyPolicy = lazy(() => import('./components/pages/zenith/ZenithPrivacyPolicy'));
const ZenithToS = lazy(() => import('./components/pages/zenith/ZenithToS'));
const StreamviewHome = lazy(() => import('./components/pages/streamview/StreamviewHome'));
const StreamviewCapabilities = lazy(() => import('./components/pages/streamview/StreamviewCapabilities'));

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
  const location = useLocation();
  const isProductRoute =
    location.pathname.startsWith('/streamview') ||
    location.pathname.startsWith('/zenith');

  return (
    <ErrorBoundary fallback={RouteErrorFallback}>
      <NavProvider>
        <ScrollToTop />
        <div className="app-wrapper">
          <Header />
          <div className={`app-content has-global-header pt-11 ${isProductRoute ? 'product-route-content' : ''}`}> {/* Offset for fixed header (2.75rem) */}
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* Zenith App Routes */}
                <Route path="/zenith" element={<ZenithHome />} />
                <Route path="/zenith/privacy-policy" element={<ZenithPrivacyPolicy />} />
                <Route path="/zenith/tos" element={<ZenithToS />} />

                {/* Streamview Case Study Routes */}
                <Route path="/streamview" element={<StreamviewHome />} />
                <Route path="/streamview/capabilities" element={<StreamviewCapabilities />} />

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
