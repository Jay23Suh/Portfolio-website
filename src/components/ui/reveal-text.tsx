import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface RevealTextProps {
  text?: string;
  textColor?: string;
  flashColor?: string;
  fontSize?: string;
  letterDelay?: number;
  flashDelay?: number;
  flashDuration?: number;
  springDuration?: number;
}

export function RevealText({
  text = 'GOAL!',
  textColor = '#FFD700',
  flashColor = '#ffffff',
  fontSize = '96px',
  letterDelay = 0.07,
  flashDelay = 0.04,
  flashDuration = 0.45,
  springDuration = 550,
}: RevealTextProps) {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const lastStart = (text.length - 1) * letterDelay * 1000;
    const timer = setTimeout(() => setShowFlash(true), lastStart + springDuration);
    return () => clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

  return (
    <div className="flex items-center justify-center select-none">
      {text.split('').map((letter, i) => (
        <motion.span
          key={i}
          className="relative overflow-visible"
          style={{
            fontSize,
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontWeight: 900,
            letterSpacing: '0.04em',
            display: 'inline-block',
            textShadow: '0 0 40px rgba(255,180,0,0.7), 4px 4px 0 rgba(0,0,0,0.5)',
            color: textColor,
            lineHeight: 1,
          }}
          initial={{ scale: 0, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            delay: i * letterDelay,
            type: 'spring',
            damping: 7,
            stiffness: 220,
            mass: 0.7,
          }}
        >
          {letter === ' ' ? ' ' : letter}

          {/* White flash sweep on each letter */}
          {showFlash && (
            <motion.span
              style={{
                position: 'absolute',
                inset: 0,
                color: flashColor,
                pointerEvents: 'none',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                lineHeight: 'inherit',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                delay: i * flashDelay,
                duration: flashDuration,
                times: [0, 0.1, 0.6, 1],
                ease: 'easeInOut',
              }}
            >
              {letter === ' ' ? ' ' : letter}
            </motion.span>
          )}
        </motion.span>
      ))}
    </div>
  );
}
