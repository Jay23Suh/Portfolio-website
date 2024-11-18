// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectOne from './pages/ProjectOne';
import ProjectTwo from './pages/ProjectTwo';
import ProjectSaverSports from './pages/ProjectSaverSports'
import Contact from './pages/Contacts';
import Sparkathon from './pages/Sparkathon'

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-navyDark via-navy to-orange text-gray-800 flex flex-col items-center">

        <header className="w-full bg-opacity-70 shadow backdrop-blur-md">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-3xl text-white font-bold hover:text-teal-200">¡JAY SUH!</h1>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-600 text-white hover:text-cyan-400">Projects</Link>
              <Link to="/contact" className="text-gray-600 text-white hover:text-lime-500">About me</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project-one" element={<ProjectOne />} />
            <Route path="/project-two" element={<ProjectTwo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ProjectSaverSports" element={<ProjectSaverSports />} />
            <Route path="/Sparkathon" element={<Sparkathon />} />
          </Routes>
        </main>

        <footer className="w-full  bg-opacity-70 text-gray-300 py-6 backdrop-blur-md">
          <div className="container mx-auto px-4 text-center text-white hover:text-indigo-400">
            <p>Jay's Portfolio</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};
// Main content for the home page
const Home: React.FC = () => (
  <section className="container mx-auto px-8 py-16 text-center bg-opacity-70 rounded-lg shadow-lg backdrop-blur-md "> {/* Added faint white border */}
    <h2 className="text-7xl text-white font-extrabold mb-20">
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



    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Link
        to="/project-one"
        className="relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 backdrop-blur-md border border-white/60"
      >
        <img src="/banner.png" alt="Project One" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-pink-500 bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-lg px-4">Intergenerational connections create meaningful relationships.</p>
        </div>
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2">Intergenerational Connectivity</h4>
        </div>
      </Link>

      <Link
        to="/project-two"
        className="relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 backdrop-blur-md border border-white/60"
      >
        <img src="/tccs.png" alt="Project Two" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-cyan-400 bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-lg px-4">Staff collaboration across campuses fosters a stronger community.</p>
        </div>
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2">Cross-campus Staff Community</h4>
        </div>
      </Link>

      <Link
        to="/ProjectSaverSports"
        className="relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 backdrop-blur-md border border-white/60"
      >
        <div className="flex justify-center p-4">
          <img src="/SaverLogo.jpeg" alt="Project Three" className="max-w-xs max-h-50 object-cover" />
        </div>
        <div className="absolute inset-0 bg-lime-800 bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-lg px-4">Saver Sports empowers young athletes through community support.</p>
        </div>
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2">Saver Sports</h4>
        </div>
      </Link>

      <Link
        to="/Sparkathon"
        className="relative bg-opacity-80 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 backdrop-blur-md border border-white/60"
      >
        <div className="flex justify-center p-4">
          <img src="/Sparkathon.png" alt="Project Three" className="w-full h-48 object-cover" />
        </div>
        <div className="absolute inset-0 bg-yellow-700 bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-lg px-4">Human-centered design, community pitch competition.</p>
        </div>
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2">Sparkathon</h4>
        </div>
      </Link>
    </div>

  </section>
);

export default App;
