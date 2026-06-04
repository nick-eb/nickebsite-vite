import { useEffect } from 'react';

/**
 * Shared scroll-reveal hook using IntersectionObserver.
 * Add `.reveal` + a variant class (e.g. `.reveal-fade-up`) to any element.
 * When the element scrolls into view, `.active` is added (one-shot).
 */
const useScrollReveal = () => {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px 100px 0px',
      threshold: 0.02,
    };

    const observed = new WeakSet<Element>();
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          intersectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const observeReveals = () => {
      document.querySelectorAll('.reveal:not(.active)').forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          intersectionObserver.observe(el);
        }
      });
    };

    observeReveals();

    const mutationObserver = new MutationObserver(observeReveals);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);
};

export default useScrollReveal;
