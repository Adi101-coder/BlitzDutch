import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingElements from './components/FloatingElements';
import Landing from './pages/Landing';
import Rules from './pages/Rules';
import Game from './pages/Game';

const App = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingElements />
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
