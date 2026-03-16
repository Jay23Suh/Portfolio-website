import { useEffect, useRef } from 'react';

const Cursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      if (dotRef.current) {
        dotRef.current.style.left = `${x}px`;
        dotRef.current.style.top = `${y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${x}px`;
        ringRef.current.style.top = `${y}px`;
      }
    };

    const growRing = () => ringRef.current?.classList.add('cursor-ring-hover');
    const shrinkRing = () => ringRef.current?.classList.remove('cursor-ring-hover');

    const clickables = 'a, button, [role="button"]';
    document.querySelectorAll<HTMLElement>(clickables).forEach(el => {
      el.addEventListener('mouseenter', growRing);
      el.addEventListener('mouseleave', shrinkRing);
    });

    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.querySelectorAll<HTMLElement>(clickables).forEach(el => {
        el.removeEventListener('mouseenter', growRing);
        el.removeEventListener('mouseleave', shrinkRing);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

export default Cursor;
