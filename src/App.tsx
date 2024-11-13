// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectOne from './pages/ProjectOne';
import ProjectTwo from './pages/ProjectTwo';
import Contact from './pages/Contacts';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-navyDark via-navy to-orange text-gray-800 flex flex-col items-center">

        <header className="w-full bg-opacity-70 shadow backdrop-blur-md">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-3xl text-white font-bold">¡JAY SUH!</h1>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-600 text-white hover:text-gray-900">Home</Link>
              <Link to="/contact" className="text-gray-600 text-white hover:text-gray-900">Contact</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project-one" element={<ProjectOne />} />
            <Route path="/project-two" element={<ProjectTwo />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <footer className="w-full  bg-opacity-70 text-gray-300 py-6 backdrop-blur-md">
          <div className="container mx-auto px-4 text-center text-white">
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
    <h2 className="text-5xl font-extrabold mb-20">
      <span className="inline-block transition duration-300 text-white hover:text-purple-600 mx-2">Human-Centered</span>
      <span className="inline-block transition duration-300 text-white hover:text-indigo-600 mx-2">Design</span>
      <span className="inline-block transition duration-300 text-white hover:text-teal-600 mx-2">Projects</span>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Link to="/project-one" className="bg-opacity-80 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 backdrop-blur-md border border-white/60">
        <img src="/intergeneration.jpg" alt="Project One" className="w-full h-48 object-cover" />
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2 text-gray-800">Intergenerational Connectivity</h4>
        </div>
      </Link>
      <Link to="/project-two" className="bg-opacity-80 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 backdrop-blur-md border border-white/60">
        <img src="/tccs.jpeg" alt="Project Two" className="w-full h-48 object-cover" />
        <div className="p-6">
          <h4 className="text-xl text-white font-semibold mb-2 text-gray-800">Cross-campus Staff Community</h4>
        </div>
      </Link>
    </div>
  </section>
);

export default App;
