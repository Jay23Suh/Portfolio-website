import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import Edulis from './pages/Edulis';
import ProjectOne from './pages/ProjectOne';
import ProjectTwo from './pages/ProjectTwo';
import ProjectSaverSports from './pages/ProjectSaverSports';
import Contact from './pages/Contacts';
import Sparkathon from './pages/Sparkathon';
import FraryTale from './pages/FraryTale';
import Ground from './pages/Ground';
import Coldplay from './pages/Coldplay';
import MapHome from './pages/MapHome';
import Work from './pages/Work';
import Cursor from './components/Cursor';
import { BackgroundGradientAnimation } from './components/ui/background-gradient-animation';
import { HeaderVisibilityProvider, useHeaderVisibility } from './hooks/useHeaderVisibility';


// ── Glass displacement filter (used by ProjectCard panels) ─
const GlassFilter: React.FC = () => (
  <svg className="hidden" aria-hidden="true">
    <defs>
      <filter id="card-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
        <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
        <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="30" xChannelSelector="R" yChannelSelector="B" result="displaced" />
        <feGaussianBlur in="displaced" stdDeviation="1.5" result="finalBlur" />
        <feComposite in="finalBlur" in2="finalBlur" operator="over" />
      </filter>
    </defs>
  </svg>
);

// ── Scroll progress bar ────────────────────────────────────
const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-50"
      style={{ scaleX, background: 'linear-gradient(to right, #a855f7, #14b8a6, #84cc16)' }}
    />
  );
};

// ── Aurora background ──────────────────────────────────────
const AuroraBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, opacity: 0.22 }}>
    <BackgroundGradientAnimation />
  </div>
);

// ── Site header — hides itself once the story scrolls past its hero ──
const SiteHeader: React.FC = () => {
  const { hidden } = useHeaderVisibility();
  return (
    <motion.header
      className="w-full bg-opacity-70 relative z-[60]"
      style={{ mixBlendMode: "multiply", pointerEvents: hidden ? 'none' : 'auto' }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -20 : 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="flex items-center justify-center">
          <img src="/JayLogo.webp" alt="Animated Logo" className="w-32 h-auto" />
        </Link>
        <nav className="flex space-x-4">
          <Link to="/" className="text-base font-beezee hover:text-lime-500">home</Link>
          <Link to="/contacts" className="text-base font-beezee hover:text-lime-500">about me</Link>
        </nav>
      </div>
    </motion.header>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <HeaderVisibilityProvider>
        <GlassFilter />
        <Cursor />
        <ScrollProgress />
        <AuroraBackground />
        <div className="min-h-screen font-patrick text-[#001d36] flex flex-col items-center">

          <SiteHeader />

          <main className="flex-grow w-full">
            <Routes>
              <Route path="/" element={<MapHome />} />
              <Route path="/work" element={<Work />} />
              <Route path="/Edulis" element={<Edulis />} />
              <Route path="/project-one" element={<ProjectOne />} />
              <Route path="/project-two" element={<ProjectTwo />} />
              <Route path="/contacts" element={<Contact />} />
              <Route path="/ProjectSaverSports" element={<ProjectSaverSports />} />
              <Route path="/Sparkathon" element={<Sparkathon />} />
              <Route path="/FraryTale" element={<FraryTale />} />
              <Route path="/Ground" element={<Ground />} />
              <Route path="/coldplay" element={<Coldplay />} />
            </Routes>
          </main>

          <footer className="w-full bg-opacity-70 text-gray-300 py-6 backdrop-blur-md">
            <Link to="/" className="container mx-auto px-4 text-center text-[#001d36] hover:text-indigo-400">
              <p>Jay's Portfolio</p>
            </Link>
          </footer>
        </div>
      </HeaderVisibilityProvider>
    </Router>
  );
};

export default App;
