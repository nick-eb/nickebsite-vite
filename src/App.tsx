import { Routes, Route } from 'react-router-dom';
import Header from './utils/Header';
import Footer from './utils/Footer';
import Home from './components/Home';
import BlogPost from './components/blog/BlogPost';
import Blog from './components/blog/Blog';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white">
      <Header />
      <div className="pt-16"> {/* Offset for fixed header */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
