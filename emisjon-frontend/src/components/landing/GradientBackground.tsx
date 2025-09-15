import React from 'react';

interface GradientOrbProps {
  className?: string;
  style?: React.CSSProperties;
}

const GradientOrb: React.FC<GradientOrbProps> = ({ className = "", style = {} }) => {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`}
      style={style}
    />
  );
};

export const GradientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(18, 79, 98, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(18, 79, 98, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Animated Gradient Orbs */}
      <GradientOrb
        className="w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-300"
        style={{
          top: '10%',
          left: '10%',
          animationDelay: '0s',
          animationDuration: '8s'
        }}
      />

      <GradientOrb
        className="w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-300"
        style={{
          top: '60%',
          right: '10%',
          animationDelay: '2s',
          animationDuration: '10s'
        }}
      />

      <GradientOrb
        className="w-64 h-64 bg-gradient-to-br from-teal-300 to-emerald-300"
        style={{
          bottom: '20%',
          left: '20%',
          animationDelay: '4s',
          animationDuration: '12s'
        }}
      />

      <GradientOrb
        className="w-72 h-72 bg-gradient-to-br from-blue-400 to-teal-400"
        style={{
          top: '30%',
          right: '30%',
          animationDelay: '6s',
          animationDuration: '9s'
        }}
      />

      {/* Accent Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-teal-400/20 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/50 to-slate-900" />
    </div>
  );
};

export default GradientBackground;