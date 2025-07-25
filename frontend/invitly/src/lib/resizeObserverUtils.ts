/**
 * 🔧 ResizeObserver Error Suppression Utilities
 * ============================================
 * 
 * Utilities to handle ResizeObserver loop errors that commonly occur
 * when observing DOM elements that change size frequently.
 */

/**
 * Wrapper for ResizeObserver that suppresses common loop errors
 */
export class SafeResizeObserver extends ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const wrappedCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      // Use requestAnimationFrame to avoid loop errors
      window.requestAnimationFrame(() => {
        try {
          callback(entries, observer);
        } catch (e) {
          // Suppress ResizeObserver loop errors
          if (e instanceof Error && e.message.includes('ResizeObserver loop')) {
            return; // Silently ignore
          }
          // Re-throw other errors
          throw e;
        }
      });
    };
    
    super(wrappedCallback);
  }
}

/**
 * Create a ResizeObserver with automatic error handling for iframe content
 * @param iframe The iframe element to observe
 * @param minHeight Minimum height for the iframe (default: 600px)
 */
export const createIframeHeightObserver = (
  iframe: HTMLIFrameElement, 
  minHeight: number = 600
): ResizeObserver | null => {
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.debug('Cannot access iframe document for height adjustment');
      return null;
    }

    const observer = new SafeResizeObserver(() => {
      try {
        const height = iframeDoc.documentElement.scrollHeight;
        if (height > 0) {
          iframe.style.height = `${Math.max(height, minHeight)}px`;
        }
      } catch (error) {
        console.debug('Cannot update iframe height:', error);
      }
    });

    observer.observe(iframeDoc.documentElement);
    return observer;
    
  } catch (error) {
    console.debug('Cannot create iframe height observer:', error);
    return null;
  }
};

/**
 * Initialize global ResizeObserver error suppression
 * Call this once at application startup
 */
export const initResizeObserverErrorSuppression = (): void => {
  // Wrap the original ResizeObserver globally
  const OriginalResizeObserver = window.ResizeObserver;
  
  if (!OriginalResizeObserver) {
    console.warn('ResizeObserver not available in this environment');
    return;
  }

  // Replace global ResizeObserver with safe version
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      const wrappedCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        window.requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (e) {
            // Suppress ResizeObserver loop errors
            if (e instanceof Error && e.message.includes('ResizeObserver loop')) {
              return; // Silently ignore
            }
            // Re-throw other errors
            throw e;
          }
        });
      };
      super(wrappedCallback);
    }
  };

  // Add global error handler for any remaining ResizeObserver errors
  const handleGlobalError = (event: ErrorEvent) => {
    const errorMessage = event.error?.message || event.message || '';
    if (typeof errorMessage === 'string' && errorMessage.includes('ResizeObserver loop')) {
      event.preventDefault(); // Prevent showing error in console
      return false;
    }
  };

  window.addEventListener('error', handleGlobalError);
  
  console.debug('✅ ResizeObserver error suppression initialized');
};

/**
 * Check if ResizeObserver is available and supported
 */
export const isResizeObserverSupported = (): boolean => {
  return typeof window !== 'undefined' && 'ResizeObserver' in window;
};