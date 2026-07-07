import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Loader from './Loader';
const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const asyncLoadingRef = useRef(false);
  const originalBodyOverflow = useRef('');
  const originalBodyPaddingRight = useRef('');
  const buttonLoadingRef = useRef(null);

  const updateLoading = () => {
    setLoading(asyncLoadingRef.current || !!buttonLoadingRef.current);
  };

  const showLoading = () => {
    asyncLoadingRef.current = true;
    updateLoading();
  };

  const hideLoading = () => {
    asyncLoadingRef.current = false;
    updateLoading();
  };

  const showButtonLoading = () => {
    if (asyncLoadingRef.current) return;
    if (buttonLoadingRef.current) {
      window.clearTimeout(buttonLoadingRef.current);
    }
    buttonLoadingRef.current = window.setTimeout(() => {
      buttonLoadingRef.current = null;
      updateLoading();
    }, 220);
    updateLoading();
  };

  const clearButtonLoading = () => {
    if (buttonLoadingRef.current) {
      window.clearTimeout(buttonLoadingRef.current);
      buttonLoadingRef.current = null;
      updateLoading();
    }
  };

  const withLoading = async (fn) => {
    showLoading();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    try {
      return await fn();
    } finally {
      hideLoading();
    }
  };

  const value = useMemo(
    () => ({ loading, showLoading, hideLoading, withLoading }),
    [loading],
  );

  useEffect(() => {
    if (loading) {
      originalBodyOverflow.current = document.body.style.overflow;
      originalBodyPaddingRight.current = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollBarWidth > 0 ? `${scrollBarWidth}px` : originalBodyPaddingRight.current;
    } else {
      document.body.style.overflow = originalBodyOverflow.current;
      document.body.style.paddingRight = originalBodyPaddingRight.current;
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow.current;
      document.body.style.paddingRight = originalBodyPaddingRight.current;
    };
  }, [loading]);

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target.closest('button, [role="button"], input[type="submit"], input[type="button"], a[href]');
      if (!target) return;
      if (asyncLoadingRef.current) return;
      setTimeout(showButtonLoading, 0);
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && (
        <div className="global-loading-overlay" aria-live="polite">
          <Loader text="Please wait" variant="overlay" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
