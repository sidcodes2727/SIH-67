import React, { useState } from 'react';

export default function Navbar({ onNavigate, onBack, canGoBack }) {
  return (
    <header className="border-b border-white/10 sticky top-0 z-40 glass">
      <div className="container py-4 md:py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button aria-label="Back" onClick={onBack} className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 transition">
              ←
            </button>
          )}
          <div className="font-semibold text-2xl md:text-3xl tracking-tight">HMPI</div>
        </div>
        <nav className="hidden md:flex gap-2 items-center">
          <button onClick={() => onNavigate('home')} className="px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5 transition-colors">Home</button>
          <button onClick={() => onNavigate('upload')} className="px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5 transition-colors">Upload Data</button>
          <button onClick={() => onNavigate('dashboard')} className="px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5 transition-colors">Dashboard</button>
          <button onClick={() => onNavigate('worldmap')} className="px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5 transition-colors">World Map</button>
          <button onClick={() => onNavigate('about')} className="px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5 transition-colors">About</button>
        </nav>
        <MobileNav onNavigate={onNavigate} />
      </div>
    </header>
  );
}

function MobileNav({ onNavigate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Open Menu"
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 transition"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-card/95 backdrop-blur border-l border-white/10 shadow-2xl p-6 animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold">Menu</span>
              <button aria-label="Close" onClick={() => setOpen(false)} className="px-2 py-1 border border-white/15 rounded hover:bg-white/5 transition">✕</button>
            </div>
            <div className="flex flex-col gap-2">
              <button className="text-left px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5" onClick={() => { onNavigate('home'); setOpen(false); }}>Home</button>
              <button className="text-left px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5" onClick={() => { onNavigate('upload'); setOpen(false); }}>Upload Data</button>
              <button className="text-left px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5" onClick={() => { onNavigate('dashboard'); setOpen(false); }}>Dashboard</button>
              <button className="text-left px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5" onClick={() => { onNavigate('worldmap'); setOpen(false); }}>World Map</button>
              <button className="text-left px-3 py-2 rounded-lg hover:text-primary hover:bg-white/5" onClick={() => { onNavigate('about'); setOpen(false); }}>About</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
