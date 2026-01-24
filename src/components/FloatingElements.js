import React from 'react';

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Cards */}
      <div className="absolute top-20 left-10 w-32 h-44 bg-white/5 rounded-lg border border-white/10 animate-float-slow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-20 w-24 h-36 bg-white/5 rounded-lg border border-white/10 animate-float-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-28 h-40 bg-white/5 rounded-lg border border-white/10 animate-float-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Floating Circles */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-glow" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-white/2 rounded-full blur-3xl animate-glow" style={{ animationDelay: '3s' }}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
    </div>
  );
};

export default FloatingElements;

