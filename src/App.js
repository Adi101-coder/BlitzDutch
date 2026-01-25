import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingElements from './components/FloatingElements';
import Landing from './pages/Landing';
import Rules from './pages/Rules';
import Game from './pages/Game';
import Lobby from './pages/Lobby';
import PaymentDemo from './pages/PaymentDemo';
import { MultiplayerProvider } from './context/MultiplayerContext';

const App = () => {
  return (
    <MultiplayerProvider>
      <div className="min-h-screen bg-black text-white">
        <FloatingElements />
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/game" element={<Game />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/payment" element={<PaymentDemo />} />
          </Routes>
        </div>
      </div>
    </MultiplayerProvider>
  );
};

export default App;
