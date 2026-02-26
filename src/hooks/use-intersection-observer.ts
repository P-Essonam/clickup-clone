import { useEffect, useRef, useState } from "react";

interface Props {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

export function useIntersectionOberser(options: Props) {
  const { threshold = 0.5, rootMargin = "100px", root = null } = options;
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin, root },
    );

    const target = targetRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [threshold, rootMargin, root]);

  return {
    targetRef,
    isIntersecting,
  };
}
