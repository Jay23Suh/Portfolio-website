import React, { useEffect } from 'react';
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
import Cursor from './components/Cursor';


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
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    <div className="aurora-layer" />
  </div>
);

// ── Project card ───────────────────────────────────────────
interface CardProps {
  to?: string;
  href?: string;
  img: string;
  imgClass: string;
  desc: string;
  title: string;
  accent: string;
  wrapped?: boolean;
  index: number;
}

const ProjectCard: React.FC<CardProps> = ({ to, href, img, imgClass, desc, title, accent, wrapped, index }) => {

  const inner = (
    <>
      {wrapped ? (
        <div className="relative overflow-hidden flex justify-center p-4">
          <img src={img} alt={title} className={`${imgClass} transition-transform duration-500 group-hover:scale-105`} />
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(to top, ${accent}55, ${accent}15)` }}
          />
          {/* Slide-up panel lives inside the image area */}
          <div
            className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.33,1,0.68,1)' }}
          >
            <div className="bg-black/75 backdrop-blur-sm px-4 py-3" style={{ borderTop: `2px solid ${accent}` }}>
              <p className="text-white text-sm leading-snug">{desc}</p>
              <span className="text-xs font-bold mt-1 inline-block" style={{ color: accent }}>View project →</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          <img src={img} alt={title} className={`${imgClass} w-full transition-transform duration-500 group-hover:scale-105`} />
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(to top, ${accent}55, ${accent}15)` }}
          />
          {/* Slide-up panel lives inside the image area */}
          <div
            className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.33,1,0.68,1)' }}
          >
            <div className="bg-black/75 backdrop-blur-sm px-4 py-3" style={{ borderTop: `2px solid ${accent}` }}>
              <p className="text-white text-sm leading-snug">{desc}</p>
              <span className="text-xs font-bold mt-1 inline-block" style={{ color: accent }}>View project →</span>
            </div>
          </div>
        </div>
      )}
      <div className="p-6">
        <h4 className="text-xl text-[#001d36] font-semibold mb-2">{title}</h4>
      </div>
    </>
  );

  const sharedClass = "tilt-card group block relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
    >
      {to ? (
        <Link to={to} className={sharedClass}>{inner}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={sharedClass}>{inner}</a>
      )}
    </motion.div>
  );
};


const App: React.FC = () => {
  return (
    <Router>
      <Cursor />
      <ScrollProgress />
      <AuroraBackground />
      <div className="min-h-screen font-patrick text-[#001d36] flex flex-col items-center">

        <motion.header
          className="w-full bg-opacity-70"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link to="/" className="flex items-center justify-center">
              <img src="/JayLogo.gif" alt="Animated Logo" className="w-32 h-auto" />
            </Link>
            <nav className="flex space-x-4">
              <Link to="/" className="text-xl font-beezee hover:text-lime-400 mx-2">Projects</Link>
              <Link to="/contact" className="text-xl font-beezee hover:text-lime-500">About me</Link>
            </nav>
          </div>
        </motion.header>

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Edulis" element={<Edulis />} />
            <Route path="/project-one" element={<ProjectOne />} />
            <Route path="/project-two" element={<ProjectTwo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ProjectSaverSports" element={<ProjectSaverSports />} />
            <Route path="/Sparkathon" element={<Sparkathon />} />
            <Route path="/FraryTale" element={<FraryTale />} />
            <Route path="/Ground" element={<Ground />} />
          </Routes>
        </main>

        <footer className="w-full bg-opacity-70 text-gray-300 py-6 backdrop-blur-md">
          <Link to="/" className="container mx-auto px-4 text-center text-[#001d36] hover:text-indigo-400">
            <p>Jay's Portfolio</p>
          </Link>
        </footer>
      </div>
    </Router>
  );
};


// ── Masked word reveal helper ──────────────────────────────
const MaskedWord: React.FC<{ children: string; className?: string }> = ({ children, className }) => (
  <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
    <motion.span
      className={`inline-block ${className ?? ''}`}
      variants={{
        hidden: { y: '110%' },
        visible: { y: '0%', transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } },
      }}
    >
      {children}
    </motion.span>
  </span>
);


const Home: React.FC = () => {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.tilt-card');
    const handleMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -8;
      const rotateY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const handleMouseLeave = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).style.transform = '';
    };
    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const taglineWords = [
    { word: 'Human-Centered', color: 'hover:text-purple-600' },
    { word: 'Design', color: 'hover:text-teal-600' },
    { word: 'Projects', color: 'hover:text-cyan-300' },
  ];

  const otherBitsWords = [
    { word: 'Other', color: 'hover:text-sky-600' },
    { word: 'bits', color: 'hover:text-rose-600' },
    { word: 'of', color: 'hover:text-slate-500' },
    { word: 'FUN', color: 'hover:text-fuchsia-500' },
    { word: '(professional)', color: 'hover:text-emerald-500' },
    { word: 'work', color: 'hover:text-yellow-300' },
  ];

  const mainCards = [
    { to: '/Edulis',             img: '/EdulisLogo.png',  imgClass: 'mx-auto w-3/4 h-48 object-cover', desc: 'A GTM strategy for a startup challenging norms.',                                               title: 'Edulis Labs',                  accent: '#a855f7' },
    { to: '/project-one',        img: '/banner.png',       imgClass: 'h-48 object-cover',               desc: 'Intergenerational connections create meaningful relationships.',                                title: 'Intergenerational Connectivity', accent: '#14b8a6' },
    { to: '/project-two',        img: '/Tccs.png',         imgClass: 'h-48 object-cover',               desc: 'Staff collaboration across campuses fosters a stronger community.',                            title: 'Cross-campus Staff Community', accent: '#6366f1' },
    { to: '/ProjectSaverSports', img: '/SaverLogo.jpeg',   imgClass: 'max-w-xs max-h-50 object-cover',  desc: 'Saver Sports empowers young athletes through community support.',                             title: 'Saver Sports',                 accent: '#84cc16', wrapped: true },
    { to: '/Sparkathon',         img: '/Sparkathon.png',   imgClass: 'h-48 object-cover',               desc: 'A Human-centered design, community pitch competition hosted by Pomona Ventures.',             title: 'Sparkathon',                   accent: '#0ea5e9', wrapped: true },
  ];

  const otherCards = [
    { to: '/FraryTale',                                    img: '/FraryTale_resized_16_9.png', imgClass: 'mx-auto w-auto h-48 object-cover', desc: 'Documenting journeys with Claremont Entrepreneurs for the community', title: 'Frary Tale',                   accent: '#f43f5e' },
    { to: '/Ground',                                       img: '/Ground.png',                 imgClass: 'mx-auto w-auto h-48 object-cover', desc: 'An accessible, light-hearted way to ground ourselves in the present.',               title: 'Ground',                       accent: '#4ade80' },
    { href: 'https://verita-ai.com',                       img: '/Verita.png',                 imgClass: 'mx-auto w-auto h-48 object-cover', desc: 'Special Projects Lead (Operations) at a multimodal data startup',    title: 'Verita AI',                    accent: '#f59e0b' },
    { href: 'https://trueventures.com',                    img: '/TVLogo2.jpg',                imgClass: 'mx-auto w-3/4 h-48 object-cover', desc: 'Data Science with Madison Reed as part of True Ventures Fellowship', title: 'Madison Reed & True Ventures', accent: '#8b5cf6' },
    { href: 'https://crater.vc/',                          img: '/crater.jpeg',                imgClass: 'mx-auto w-auto h-48 object-cover', desc: 'Investing in SoCal\'s biggest dreamers at early stages',            title: 'Crescent Fund & Crater Ventures', accent: '#10b981' },
  ];

  return (
    <section className="container mx-auto px-8 py-16 text-center bg-opacity-70 rounded-lg backdrop-blur-md">

      {/* ── Hero title — character stagger ── */}
      <motion.h1
        className="text-5xl md:text-5xl font-bold"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.045 } } }}
      >
        {"Hi, I'm Jay!".split('').map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 24, rotateX: -80 },
              visible: {
                opacity: 1, y: 0, rotateX: 0,
                transition: { type: 'spring', stiffness: 220, damping: 16 },
              },
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>

      {/* ── Big headline — blur reveal ── */}
      <motion.h1
        className="text-7xl md:text-7xl text-[#001d36] font-bold mb-20"
        initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, delay: 0.55, ease: 'easeOut' }}
      >
        I bring a{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-teal-400 to-lime-500 animate-gradient relative inline-block before:content-['']">
          human-centered
        </span>{' '}
        approach to find and tackle real problems.
      </motion.h1>

      {/* ── Tagline — masked word reveal ── */}
      <motion.h2
        className="text-4xl text-[#001d36] font-beezee font-extrabold mb-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } } }}
      >
        {taglineWords.map(({ word, color }) => (
          <span key={word} className="mx-2">
            <MaskedWord className={`transition duration-300 transform hover:scale-110 hover:-translate-y-1 ${color}`}>
              {word}
            </MaskedWord>
          </span>
        ))}
      </motion.h2>

      {/* ── Bouncing arrow ── */}
      <motion.div
        className="flex justify-center mt-8 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 12, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 1.2 },
          y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
        }}
      >
        <img src="/arrow-fat-down.svg" alt="Scroll down" className="w-20 h-20" />
      </motion.div>

      {/* ── Main project cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {mainCards.map((card, i) => (
          <ProjectCard key={card.to} {...card} index={i} />
        ))}

        <motion.div
          className="text-6xl mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          animate={{ y: [0, -10, 0] }}
        >
          <span className="hover:text-green-500 inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-10">
            Keep scrolling!
          </span>
        </motion.div>
      </div>

      {/* ── "Other bits of FUN work" heading ── */}
      <motion.h2
        className="text-4xl text-[#001d36] font-beezee font-extrabold mb-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {otherBitsWords.map(({ word, color }) => (
          <span key={word} className="mx-2">
            <MaskedWord className={`transition duration-300 transform hover:scale-110 hover:-translate-y-1 ${color}`}>
              {word}
            </MaskedWord>
          </span>
        ))}
      </motion.h2>

      <motion.div
        className="flex justify-center mt-8 mb-10"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src="/arrow-fat-down.svg" alt="Scroll down" className="w-20 h-20" />
      </motion.div>

      {/* ── Other work cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {otherCards.map((card, i) => (
          <ProjectCard key={card.href ?? card.to} {...card} index={i} />
        ))}
      </div>

    </section>
  );
};


export default App;
