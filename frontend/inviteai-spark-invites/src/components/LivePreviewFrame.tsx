import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { createIframeHeightObserver } from '@/lib/resizeObserverUtils';

// Device modes and corresponding wrapper widths
export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const widthByMode: Record<PreviewMode, string> = {
  desktop: 'w-full',
  tablet: 'w-3/4 max-w-[820px]',
  mobile: 'w-full max-w-[430px]',
};

interface LivePreviewFrameProps {
  html: string;
  mode?: PreviewMode;
  onModeChange?: (m: PreviewMode) => void;
  toolbar?: React.ReactNode | null; // null → hide toolbar, undefined → default
  className?: string;
  minHeight?: number;
}

const LivePreviewFrame: React.FC<LivePreviewFrameProps> = ({
  html,
  mode = 'desktop',
  onModeChange,
  toolbar,
  className = '',
  minHeight,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentMode, setCurrentMode] = useState<PreviewMode>(mode);

  // auto-height for responsive content inside iframe
  useEffect(() => {
    if (!iframeRef.current) return;
    const observer = createIframeHeightObserver(iframeRef.current);

    // Return cleanup that disconnects observer on unmount
    return () => {
      try {
        // Some browsers expose disconnect(), older polyfills use unobserve(), so guard both
        // @ts-ignore
        if (observer?.disconnect) observer.disconnect();
        // @ts-ignore
        else if (observer?.unobserve) observer.unobserve();
      } catch (e) {
        // noop
      }
    };
  }, []);

  // update srcdoc on html change
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html || '<div></div>';
    }
  }, [html]);

  // propagate mode external changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const changeMode = (m: PreviewMode) => {
    setCurrentMode(m);
    onModeChange?.(m);
  };

  // decide toolbar content
  let toolbarNode: React.ReactNode = null;
  if (toolbar === undefined) {
    // default toolbar buttons
    toolbarNode = (
      <div className="flex gap-1 bg-white/70 backdrop-blur-sm rounded-md p-1 shadow-sm">
        {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={clsx(
              'px-2 py-1 text-xs rounded',
              currentMode === m ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {m[0].toUpperCase()}
          </button>
        ))}
      </div>
    );
  } else if (toolbar !== null) {
    toolbarNode = toolbar;
  }

  return (
    <>
      {/* toolbar, if any */}
      {toolbarNode && (
        <div className="absolute top-2 right-2 z-10">{toolbarNode}</div>
      )}

      <iframe
        ref={iframeRef}
        title="Live Preview"
        className={clsx(
          'w-full border-0 flex-1',
          widthByMode[currentMode],
          className
        )}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        style={{ minHeight: (minHeight || 600) }}
      />
    </>
  );
};

export default LivePreviewFrame; 