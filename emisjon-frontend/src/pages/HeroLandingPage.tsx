import React, { useState } from 'react';
import GradientBackground from '../components/landing/GradientBackground';
import HeroSection from '../components/landing/HeroSection';
import StatsDisplay from '../components/landing/StatsDisplay';
import FloatingCards from '../components/landing/FloatingCards';
import EarlyAccessModal from '../components/landing/EarlyAccessModal';

export const HeroLandingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEarlyAccessClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <GradientBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Side - Hero Content */}
            <div className="order-2 lg:order-1">
              <HeroSection onEarlyAccessClick={handleEarlyAccessClick} />
            </div>

            {/* Right Side - Floating Cards */}
            <div className="order-1 lg:order-2 relative h-[600px] lg:h-screen">
              <FloatingCards />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative">
          <StatsDisplay />
        </div>

        {/* Features Preview Section */}
        <div className="py-20 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything you need to{' '}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  raise capital
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From initial planning to successful exit, our platform provides all the tools
                and insights you need to manage your equity efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Smart Dashboard',
                  description: 'Get real-time insights into your emissions, investor activity, and market performance.',
                  features: ['Real-time analytics', 'Performance tracking', 'Custom reports']
                },
                {
                  title: 'Investor Relations',
                  description: 'Streamline communication and build lasting relationships with your investor network.',
                  features: ['Automated updates', 'Document sharing', 'Investor portal']
                },
                {
                  title: 'Compliance Made Easy',
                  description: 'Stay compliant with automated reporting and built-in regulatory frameworks.',
                  features: ['Regulatory reporting', 'Audit trails', 'Legal templates']
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-400">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="py-20 px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your{' '}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                equity management?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join forward-thinking companies who are already using Emisjon to streamline
              their capital raising and investor relations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleEarlyAccessClick}
                className="group px-10 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Get Early Access
              </button>
              <button className="px-10 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg backdrop-blur-sm border border-white/20 hover:border-white/30">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-2xl font-bold text-white">Emisjon</span>
            </div>
            <p className="text-gray-400 mb-4">
              © 2024 Emisjon Platform. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Empowering the future of equity management and capital raising.
            </p>
          </div>
        </footer>
      </div>

      {/* Early Access Modal */}
      <EarlyAccessModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default HeroLandingPage;