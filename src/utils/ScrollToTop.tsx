import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    // If there's a specific scroll target in the state, don't scroll to top
    if (state?.scrollTo) {
      return;
    }
    
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname, state]);

  return null;
};

export default ScrollToTop;
