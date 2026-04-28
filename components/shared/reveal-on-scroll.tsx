"use client";

import { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export function RevealOnScroll({
  children,
  className = "",
  threshold = 0.12
}: RevealOnScrollProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, visible]);

  return (
    <div ref={containerRef} className={`reveal-scroll ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

