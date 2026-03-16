import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Edulis from './pages/Edulis';
import ProjectOne from './pages/ProjectOne';
import ProjectTwo from './pages/ProjectTwo';
import ProjectSaverSports from './pages/ProjectSaverSports';
import Contact from './pages/Contacts';
import Sparkathon from './pages/Sparkathon';
import FraryTale from './pages/FraryTale';
import Cursor from './components/Cursor';


const App: React.FC = () => {
  return (
    <Router>
      <Cursor />
      <div className="min-h-screen font-patrick bg-[#FCFCFC] text-[#001d36] flex flex-col items-center">

        <header className="w-full bg-opacity-70 ">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link to="/" className="flex items-center justify-center">
              <img
                src="/JayLogo.gif"
                alt="Animated Logo"
                className="w-32 h-auto"
              />
            </Link>
            <nav className="flex space-x-4">
              <Link to="/" className="text-xl font-beezee hover:text-lime-400 mx-2">Projects</Link>
              <Link to="/contact" className="text-xl font-beezee  hover:text-lime-500">About me</Link>
            </nav>
          </div>
        </header>

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


const Home: React.FC = () => {
  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

    // Card tilt
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
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    };
    const handleMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = '';
    };
    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      observer.disconnect();
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <section className="container mx-auto px-8 py-16 text-center bg-opacity-70 rounded-lg backdrop-blur-md">

      <h1 className="text-3xl md:text-5xl font-bold"> Hi, I'm Jay! </h1>
      <h1 className="text-4xl md:text-7xl text-[#001d36] font-bold mb-20">I bring a {' '} <span
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-teal-400 to-lime-500 animate-gradient relative inline-block before:content-[''] ">human-centered </span>{' '} approach to find and tackle real problems. </h1>

      <h2 className="text-4xl text-[#001d36] font-beezee font-extrabold mb-6">
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-purple-600 mx-2">
          Human-Centered
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-teal-600 mx-2">
          Design
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-lime-500 mx-2">
          +
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-indigo-500 mx-2">
          Personal
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-cyan-300 mx-2">
          Projects
        </span>
      </h2>
      {/* arrow */}
      <div className="flex justify-center mt-8 mb-10">
        <img src="/arrow-fat-down.svg" alt="Scroll down" className="w-20 h-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Link
          to="/Edulis"
          className="tilt-card reveal-on-scroll relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '0ms' }}
        >
          <img src="/EdulisLogo.png" alt="Edulis Labs" className="mx-auto w-3/4 h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">A GTM strategy for a startup challenging norms.</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Edulis Labs</h4>
          </div>
        </Link>

        <Link
          to="/project-one"
          className="tilt-card reveal-on-scroll relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '100ms' }}
        >
          <img src="/banner.png" alt="Project One" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">Intergenerational connections create meaningful relationships.</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Intergenerational Connectivity</h4>
          </div>
        </Link>

        <Link
          to="/project-two"
          className="tilt-card reveal-on-scroll relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '200ms' }}
        >
          <img src="/Tccs.png" alt="Project Two" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">Staff collaboration across campuses fosters a stronger community.</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Cross-campus Staff Community</h4>
          </div>
        </Link>

        <Link
          to="/ProjectSaverSports"
          className="tilt-card reveal-on-scroll relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '300ms' }}
        >
          <div className="flex justify-center p-4">
            <img src="/SaverLogo.jpeg" alt="Saver Sports" className="max-w-xs max-h-50 object-cover" />
          </div>
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">Saver Sports empowers young athletes through community support.</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Saver Sports</h4>
          </div>
        </Link>

        <Link
          to="/Sparkathon"
          className="tilt-card reveal-on-scroll relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex justify-center p-4">
            <img src="/Sparkathon.png" alt="Sparkathon" className="w-full h-48 object-cover" />
          </div>
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">A Human-centered design, community pitch competition hosted by Pomona Ventures.</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Sparkathon</h4>
          </div>
        </Link>
        <div className="text-6xl mt-24 hover:text-green-500 inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-10">
          Keep scrolling!
        </div>
      </div>

      {/* Other work */}
      <h2 className="text-4xl text-[#001d36] font-beezee font-extrabold mb-6">
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-sky-600 mx-2">
          Other
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-rose-600 mx-2">
          bits
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-slate-500 mx-2">
          of
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-fuchsia-500 mx-2">
          FUN
        </span>
        <span className="inline-block transition duration-300 transform hover:scale-110 hover:-translate-y-1 hover:text-yellow-300 mx-2">
          work
        </span>
      </h2>
      <div className="flex justify-center mt-8 mb-10">
        <img src="/arrow-fat-down.svg" alt="Scroll down" className="w-20 h-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Link
          to="/FraryTale"
          className="tilt-card reveal-on-scroll relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '0ms' }}
        >
          <img src="/FraryTale_resized_16_9.png" alt="Frary Tale" className="mx-auto w-auto h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">Documenting journeys with Claremont Entrepreneurs for the community</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Frary Tale</h4>
          </div>
        </Link>
        <a
          href="https://verita-ai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="tilt-card reveal-on-scroll block relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '100ms' }}
        >
          <img src="/Verita.png" alt="Verita AI" className="mx-auto w-auto h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">Special Projects Lead (Operations) at a multimodal data startup</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Verita AI</h4>
          </div>
        </a>

        <a
          href="https://trueventures.com"
          target="_blank"
          rel="noopener noreferrer"
          className="tilt-card reveal-on-scroll block relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '200ms' }}
        >
          <img src="/TVLogo2.jpg" alt="True Ventures & Madison Reed" className="mx-auto w-3/4 h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-[#FCFCFC] text-xl px-4">Data Science with Madison Reed as part of True Ventures Fellowship</p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Madison Reed & True Ventures</h4>
          </div>
        </a>
        <a
          href="https://crater.vc/"
          target="_blank"
          rel="noopener noreferrer"
          className="tilt-card reveal-on-scroll block relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden backdrop-blur-md border border-white/60"
          style={{ transitionDelay: '300ms' }}
        >
          <img src="/crater.jpeg" alt="Crescent Fund & Crater Ventures" className="mx-auto w-auto h-48 object-cover" />
          <div className="absolute inset-0 bg-lime-800 bg-opacity-95 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
            <p className="text-[#FCFCFC] text-xl px-4 text-center">
              Investing in SoCal's biggest dreamers at early stages
            </p>
          </div>
          <div className="p-6">
            <h4 className="text-xl text-[#001d36] font-semibold mb-2">Crescent Fund & Crater Ventures</h4>
          </div>
        </a>
      </div>
    </section>
  );
};


export default App;
