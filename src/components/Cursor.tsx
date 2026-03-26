import { useEffect, useRef } from 'react';

const Cursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
      }
    };

    // Smooth trailing ring via lerp
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      rafId = requestAnimationFrame(animateRing);
    };
    rafId = requestAnimationFrame(animateRing);

    // Click pulse burst
    const onMouseDown = () => {
      if (pulseRef.current) {
        pulseRef.current.style.left = `${mouseX}px`;
        pulseRef.current.style.top = `${mouseY}px`;
        pulseRef.current.classList.remove('cursor-pulse-active');
        void pulseRef.current.offsetWidth; // force reflow to restart animation
        pulseRef.current.classList.add('cursor-pulse-active');
      }
      dotRef.current?.classList.add('cursor-dot-click');
    };
    const onMouseUp = () => dotRef.current?.classList.remove('cursor-dot-click');

    // Context-aware hover states
    const onEnterLink = () => {
      ringRef.current?.classList.add('cursor-ring-hover');
      dotRef.current?.classList.add('cursor-dot-hidden');
    };
    const onEnterCard = () => {
      ringRef.current?.classList.add('cursor-ring-card');
      dotRef.current?.classList.add('cursor-dot-hidden');
    };
    const onLeave = () => {
      ringRef.current?.classList.remove('cursor-ring-hover', 'cursor-ring-card');
      dotRef.current?.classList.remove('cursor-dot-hidden');
    };

    const links = document.querySelectorAll<HTMLElement>('a, button, [role="button"]');
    const cards = document.querySelectorAll<HTMLElement>('.tilt-card');

    links.forEach(el => {
      el.addEventListener('mouseenter', onEnterLink);
      el.addEventListener('mouseleave', onLeave);
    });
    cards.forEach(el => {
      el.addEventListener('mouseenter', onEnterCard);
      el.addEventListener('mouseleave', onLeave);
    });

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      links.forEach(el => {
        el.removeEventListener('mouseenter', onEnterLink);
        el.removeEventListener('mouseleave', onLeave);
      });
      cards.forEach(el => {
        el.removeEventListener('mouseenter', onEnterCard);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={pulseRef} className="cursor-pulse" />
    </>
  );
};

export default Cursor;
