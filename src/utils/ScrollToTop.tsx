import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    // If there's a specific scroll target, don't interfere
    if (state?.scrollTo) {
      return;
    }

    // In all other cases, scroll to top
    window.scrollTo(0, 0);
  }, [pathname, state]);

  return null;
};

export default ScrollToTop;
