import React from 'react';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1220] border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => onNavigate('/')}
          className="cursor-pointer whitespace-nowrap shrink-0"
        >
          <BrandLogo size="md" variant="dark" showTagline={false} />
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('/')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentPath === '/' ? 'text-white font-semibold' : 'text-slate-300'
            }`}
          >
            Home
          </button>
          <a
            href="#how-it-works"
            className="transition-colors whitespace-nowrap shrink-0 text-slate-300 hover:text-white"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="transition-colors whitespace-nowrap shrink-0 text-slate-300 hover:text-white"
          >
            Features
          </a>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="transition-colors whitespace-nowrap shrink-0 text-slate-300 hover:text-white"
          >
            Live Operations
          </button>
          <button
            onClick={() => onNavigate('/about')}
            className="transition-colors whitespace-nowrap shrink-0 text-slate-300 hover:text-white"
          >
            About
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('/report-emergency')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#E53945] rounded-lg hover:bg-[#d02e3a] transition-all shadow-sm hover:shadow-md hover:shadow-[#E53945]/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Report Emergency
          </button>
        </div>
      </div>
    </header>
  );
};
