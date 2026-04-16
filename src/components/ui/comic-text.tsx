import { motion } from "motion/react";
import { CSSProperties } from "react";

type ComicTextProps = {
  children: string;
  className?: string;
  style?: CSSProperties;
  fontSize?: number;
  dotColor?: string;
  backgroundColor?: string;
  /** Pass true when a parent is controlling visibility — skips the built-in entrance animation */
  disableAnimation?: boolean;
};

export function ComicText({
  children,
  className,
  style,
  fontSize = 5,
  dotColor = "#EF4444",
  backgroundColor = "#FACC15",
  disableAnimation = false,
}: ComicTextProps) {
  if (typeof children !== "string") {
    throw new Error("ComicText children must be a string");
  }

  return (
    <motion.div
      className={["select-none text-center", className].filter(Boolean).join(" ")}
      style={{
        fontSize: `${fontSize}rem`,
        fontFamily: "'Bangers', 'Comic Sans MS', 'Impact', sans-serif",
        fontWeight: "900",
        WebkitTextStroke: `${fontSize * 0.35}px #000000`,
        transform: "skewX(-10deg)",
        textTransform: "uppercase",
        filter: `drop-shadow(5px 5px 0px #000000) drop-shadow(3px 3px 0px ${dotColor})`,
        backgroundColor: backgroundColor,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: "8px 8px",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
      initial={disableAnimation
        ? { opacity: 1, scale: 1, rotate: 0 }
        : { opacity: 0, scale: 0.8, rotate: -2 }
      }
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={disableAnimation
        ? { duration: 0 }
        : { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275], type: "spring" }
      }
    >
      {children}
    </motion.div>
  );
}
