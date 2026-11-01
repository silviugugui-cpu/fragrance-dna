'use client';

import { useLayoutEffect, useRef } from 'react';

export default function AutoFitLabel({ children }: { children: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const availableWidth = container.getBoundingClientRect().width;
      if (availableWidth <= 0) return;

      text.style.removeProperty('font-size');
      const preferredSize = parseFloat(getComputedStyle(text).fontSize);
      const naturalWidth = text.getBoundingClientRect().width;
      if (naturalWidth > availableWidth) {
        let lower = 0;
        let upper = preferredSize;
        for (let step = 0; step < 12; step += 1) {
          const size = (lower + upper) / 2;
          text.style.fontSize = `${size}px`;
          if (text.getBoundingClientRect().width <= availableWidth - 0.5) {
            lower = size;
          } else {
            upper = size;
          }
        }
        text.style.fontSize = `${lower}px`;
      }
    };

    const observer = new ResizeObserver(fit);
    observer.observe(container);
    document.fonts.addEventListener('loadingdone', fit);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) fit();
    });
    fit();

    return () => {
      active = false;
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', fit);
    };
  }, [children]);

  return (
    <span ref={containerRef} className="block w-full min-w-0">
      <span ref={textRef} className="inline-block w-max whitespace-nowrap">{children}</span>
    </span>
  );
}
