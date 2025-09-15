import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onEarlyAccessClick: () => void;
}

const LiveIndicator: React.FC = () => {
  return (
    <div className="inline-flex items-center px-4 py-2 bg-teal-900/20 border border-teal-400/30 rounded-full backdrop-blur-sm">
      <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse mr-2" />
      <span className="text-teal-300 text-sm font-medium">Coming Soon</span>
    </div>
  );
};

const HeroNavigation: React.FC<{ onEarlyAccessClick: () => void }> = ({ onEarlyAccessClick }) => {
  return (
    <nav className="relative z-10 flex items-center justify-between py-6 px-8">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Emisjon</span>
      </div>

      <button
        onClick={onEarlyAccessClick}
        className="px-6 py-3 bg-teal-900 text-white rounded-xl hover:bg-teal-800 transition-all duration-300 font-medium border border-teal-700/50 hover:border-teal-600 shadow-lg hover:shadow-xl"
      >
        Early Access
      </button>
    </nav>
  );
};

const AnimatedTitle: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center max-w-5xl mx-auto">
      <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-6">
          <span className="block bg-gradient-to-r from-white via-teal-100 to-cyan-200 bg-clip-text text-transparent">
            EMISJON
          </span>
          <span className="block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            PLATFORM
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          The future of equity management and share emissions.
          <span className="text-teal-300"> Streamline your capital raising process</span> with our
          comprehensive platform.
        </p>
      </div>
    </div>
  );
};

const HeroActions: React.FC<{ onEarlyAccessClick: () => void }> = ({ onEarlyAccessClick }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
      <button
        onClick={onEarlyAccessClick}
        className="group px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2"
      >
        <span>Get Early Access</span>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <button className="group px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg backdrop-blur-sm border border-white/20 hover:border-white/30 flex items-center space-x-2">
        <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span>Watch Demo</span>
      </button>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onEarlyAccessClick }) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <HeroNavigation onEarlyAccessClick={onEarlyAccessClick} />

      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <LiveIndicator />
          </div>

          <AnimatedTitle />
          <HeroActions onEarlyAccessClick={onEarlyAccessClick} />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;