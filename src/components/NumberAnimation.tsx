import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface NumberAnimationProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const NumberAnimation: React.FC<NumberAnimationProps> = ({ target, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) {
      setCount(0); // Reset count when out of view
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();

    const animate = (currentTime: DOMHighResTimeStamp) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const progress = (currentTime - startTimeRef.current) / duration;

      if (progress < 1) {
        setCount(Math.min(target, Math.floor(progress * target)));
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
        cancelAnimationFrame(animationFrameRef.current!);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default NumberAnimation;
