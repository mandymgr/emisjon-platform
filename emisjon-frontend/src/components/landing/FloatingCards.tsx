import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Building2, PieChart, BarChart3, Activity } from 'lucide-react';

interface MousePosition {
  x: number;
  y: number;
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, className = "", style = {} }) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      style={style}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-teal-100 rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className="text-green-500 text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const ChartCard: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style = {} }) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      style={style}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-semibold">Emission Performance</h3>
        <BarChart3 className="h-5 w-5 text-teal-600" />
      </div>
      <div className="space-y-3">
        {[
          { label: 'Q1 2024', value: 85, color: 'bg-teal-500' },
          { label: 'Q2 2024', value: 92, color: 'bg-cyan-500' },
          { label: 'Q3 2024', value: 78, color: 'bg-blue-500' },
          { label: 'Q4 2024', value: 95, color: 'bg-emerald-500' }
        ].map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 w-16">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${item.color}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-8">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FloatingCards: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const getParallaxStyle = (intensity: number = 1): React.CSSProperties => {
    return {
      transform: `translateX(${mousePosition.x * intensity * 20}px) translateY(${mousePosition.y * intensity * 20}px) rotateX(${mousePosition.y * intensity * 5}deg) rotateY(${mousePosition.x * intensity * 5}deg)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] flex items-center justify-center perspective-1000"
      style={{ perspective: '1000px' }}
    >
      {/* Main Dashboard Card - Center */}
      <DashboardCard
        title="Total Capital Raised"
        value="€2.4M"
        icon={<Building2 className="h-6 w-6 text-teal-600" />}
        trend="+24%"
        className="relative z-10 transform-gpu"
        style={{
          ...getParallaxStyle(0.5),
          animationDelay: '0s'
        }}
      />

      {/* Secondary Cards - Floating around */}
      <DashboardCard
        title="Active Investors"
        value="156"
        icon={<Users className="h-5 w-5 text-teal-600" />}
        trend="+12%"
        className="absolute top-8 left-8 w-64 transform-gpu animate-float"
        style={{
          ...getParallaxStyle(1.2),
          animationDelay: '1s'
        }}
      />

      <DashboardCard
        title="Share Price"
        value="€45.50"
        icon={<TrendingUp className="h-5 w-5 text-teal-600" />}
        trend="+8.2%"
        className="absolute top-16 right-12 w-64 transform-gpu animate-float"
        style={{
          ...getParallaxStyle(0.8),
          animationDelay: '2s'
        }}
      />

      <ChartCard
        className="absolute bottom-12 left-16 w-80 transform-gpu animate-float"
        style={{
          ...getParallaxStyle(1.5),
          animationDelay: '3s'
        }}
      />

      <DashboardCard
        title="Market Cap"
        value="€8.2M"
        icon={<PieChart className="h-5 w-5 text-teal-600" />}
        className="absolute bottom-8 right-8 w-64 transform-gpu animate-float"
        style={{
          ...getParallaxStyle(0.7),
          animationDelay: '4s'
        }}
      />

      <DashboardCard
        title="ROI Average"
        value="18.4%"
        icon={<Activity className="h-5 w-5 text-teal-600" />}
        trend="+5.1%"
        className="absolute top-1/2 left-4 w-60 transform-gpu animate-float"
        style={{
          ...getParallaxStyle(1.0),
          animationDelay: '5s'
        }}
      />

      {/* Background Cards for Depth */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-48 h-32 bg-white/20 rounded-xl backdrop-blur-sm transform-gpu animate-float"
             style={{ ...getParallaxStyle(2.0), animationDelay: '6s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-52 h-36 bg-white/20 rounded-xl backdrop-blur-sm transform-gpu animate-float"
             style={{ ...getParallaxStyle(1.8), animationDelay: '7s' }} />
      </div>
    </div>
  );
};

export default FloatingCards;