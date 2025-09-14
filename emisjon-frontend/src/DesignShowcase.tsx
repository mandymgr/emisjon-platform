
// Scandinavian Hero Section
const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#F7F7F5] dark:bg-gradient-to-b dark:from-[#0C3C4A] dark:to-[#124F62]">
      {/* Subtle Scandinavian Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, #124F62 0, #124F62 0.5px, transparent 0.5px, transparent 120px),
                           repeating-linear-gradient(0deg, #124F62 0, #124F62 0.5px, transparent 0.5px, transparent 120px)`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1
          className="text-7xl md:text-9xl font-normal tracking-tight mb-8 text-[#0E1A1C] dark:text-white"
          style={{ fontFamily: '"EB Garamond", serif' }}
        >
          OBLINOR
        </h1>
        <p className="text-xl md:text-2xl font-light text-[#124F62] dark:text-white/90 tracking-wide mb-4">
          Transparent Real Estate Crowdfunding
        </p>
        <p className="text-base font-light text-black/60 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
          Building transparency in property investments through innovative shareholder management
        </p>

        <div className="mt-16 flex gap-6 justify-center flex-wrap">
          <button className="px-10 py-4 bg-[#124F62] text-white font-light tracking-wider hover:bg-[#0C3C4A] transition-all duration-300 rounded-sm">
            Explore Projects
          </button>
          <button className="px-10 py-4 border border-[#124F62] text-[#124F62] dark:text-white dark:border-white font-light tracking-wider hover:bg-[#124F62] hover:text-white dark:hover:bg-white dark:hover:text-[#124F62] transition-all duration-300 rounded-sm">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

// Vision Grid Section - Real Estate Focus
const VisionGrid = () => {
  const visionAreas = [
    { id: 1, span: 'col-span-2 row-span-2', title: 'Property Investment', description: 'Transparent real estate crowdfunding' },
    { id: 2, span: 'col-span-1 row-span-1', title: 'Shareholder Transparency', description: 'Complete portfolio visibility' },
    { id: 3, span: 'col-span-1 row-span-2', title: 'Growth Opportunities', description: 'Curated property projects' },
    { id: 4, span: 'col-span-1 row-span-1', title: 'Secure Platform', description: 'Bank-grade security' },
    { id: 5, span: 'col-span-2 row-span-1', title: 'Analytics & Insights', description: 'Real-time performance data' },
  ];

  return (
    <section className="py-32 px-6 bg-white dark:bg-[#0F2C36]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2
            className="text-6xl font-normal tracking-tight text-[#0E1A1C] dark:text-white mb-6"
            style={{ fontFamily: '"EB Garamond", serif' }}
          >
            Our Vision
          </h2>
          <p className="text-xl font-light text-black/70 dark:text-white/70 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing real estate investment through transparent, accessible, and secure crowdfunding solutions
          </p>
          <div className="w-16 h-px bg-[#124F62] mx-auto mt-8" />
        </div>

        <div className="grid grid-cols-4 grid-rows-3 gap-6 h-[700px]">
          {visionAreas.map((area) => (
            <div
              key={area.id}
              className={`${area.span} relative group overflow-hidden bg-[#F7F7F5] dark:bg-white/5 rounded-lg`}
              role="article"
              aria-labelledby={`vision-${area.id}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#124F62]/10 to-[#278899]/10 group-hover:from-[#124F62]/20 group-hover:to-[#278899]/20 transition-all duration-500" />
              <div className="absolute inset-0 bg-[#124F62] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

              <div className="absolute inset-6 flex flex-col justify-end">
                <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  <h3
                    id={`vision-${area.id}`}
                    className="text-lg font-light tracking-wide text-[#0E1A1C] dark:text-white mb-2 uppercase"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    {area.title}
                  </h3>
                  <p className="text-sm font-light text-black/60 dark:text-white/60 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Scandinavian Navigation
const ScandinavianNav = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0C3C4A]/95 backdrop-blur-sm border-b border-[#E6E6E0] dark:border-white/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1
          className="text-2xl font-normal tracking-wider text-[#124F62] dark:text-white"
          style={{ fontFamily: '"EB Garamond", serif' }}
        >
          OBLINOR
        </h1>

        <div className="flex gap-8 items-center">
          <a
            href="#vision"
            className="text-sm font-light tracking-wide text-black/70 hover:text-[#124F62] dark:text-white/70 dark:hover:text-white transition-colors"
            aria-label="Learn about our vision"
          >
            About
          </a>
          <a
            href="#platform"
            className="text-sm font-light tracking-wide text-black/70 hover:text-[#124F62] dark:text-white/70 dark:hover:text-white transition-colors"
            aria-label="View platform features"
          >
            Platform
          </a>
          <a
            href="#analytics"
            className="text-sm font-light tracking-wide text-black/70 hover:text-[#124F62] dark:text-white/70 dark:hover:text-white transition-colors"
            aria-label="View analytics features"
          >
            Analytics
          </a>
          <a
            href="#contact"
            className="text-sm font-light tracking-wide text-black/70 hover:text-[#124F62] dark:text-white/70 dark:hover:text-white transition-colors"
            aria-label="Contact information"
          >
            Contact
          </a>

          <button
            className="px-6 py-2.5 bg-[#124F62] text-white text-sm font-light tracking-wide hover:bg-[#0C3C4A] dark:hover:bg-[#278899] transition-all duration-200 rounded-sm"
            aria-label="Sign in to your account"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

// Typography Showcase
const TypographyShowcase = () => {
  return (
    <section className="py-32 px-6 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-light tracking-tight text-neutral-900 mb-16">
          Typography System
        </h2>

        <div className="grid grid-cols-2 gap-16">
          <div>
            <p className="text-sm font-light tracking-wider uppercase text-neutral-500 mb-4">Headlines</p>
            <h1 className="text-7xl font-light tracking-tighter mb-4">Display</h1>
            <h2 className="text-5xl font-light tracking-tight mb-4">Heading 1</h2>
            <h3 className="text-3xl font-light tracking-tight mb-4">Heading 2</h3>
            <h4 className="text-xl font-light tracking-tight mb-4">Heading 3</h4>
          </div>

          <div>
            <p className="text-sm font-light tracking-wider uppercase text-neutral-500 mb-4">Body Text</p>
            <p className="text-lg font-light leading-relaxed mb-4 text-neutral-700">
              Large body text for emphasis and introductions. Perfect for highlighting key information.
            </p>
            <p className="text-base font-light leading-relaxed mb-4 text-neutral-600">
              Regular body text for general content. Optimized for readability and clean presentation.
            </p>
            <p className="text-sm font-light leading-relaxed text-neutral-500">
              Small text for captions, labels, and secondary information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Oblinor Color System
const OblinorColorSystem = () => {
  const colors = [
    { name: 'Deep Teal', value: '#0C3C4A', class: 'bg-[#0C3C4A]', category: 'Primary' },
    { name: 'Mid Teal', value: '#124F62', class: 'bg-[#124F62]', category: 'Primary' },
    { name: 'Light Teal', value: '#1C6A7E', class: 'bg-[#1C6A7E]', category: 'Primary' },
    { name: 'Accent Blue', value: '#278899', class: 'bg-[#278899]', category: 'Primary' },
    { name: 'Silver', value: '#E8E8F0', class: 'bg-[#E8E8F0]', category: 'Neutral' },
    { name: 'Light Gray', value: '#F7F7F5', class: 'bg-[#F7F7F5]', category: 'Neutral' },
    { name: 'Border', value: '#E6E6E0', class: 'bg-[#E6E6E0]', category: 'Neutral' },
    { name: 'Charcoal', value: '#111111', class: 'bg-[#111111]', category: 'Neutral' },
    { name: 'Pure White', value: '#FFFFFF', class: 'bg-white border border-[#E6E6E0]', category: 'Base' },
  ];

  const groupedColors = colors.reduce((acc, color) => {
    if (!acc[color.category]) acc[color.category] = [];
    acc[color.category].push(color);
    return acc;
  }, {} as Record<string, typeof colors>);

  return (
    <section id="colors" className="py-32 px-6 bg-[#F7F7F5] dark:bg-[#0F2C36]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2
            className="text-6xl font-normal tracking-tight text-[#0E1A1C] dark:text-white mb-6"
            style={{ fontFamily: '"EB Garamond", serif' }}
          >
            Design System
          </h2>
          <p className="text-xl font-light text-black/70 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
            Professional Scandinavian color palette inspired by Nordic minimalism and financial transparency
          </p>
          <div className="w-16 h-px bg-[#124F62] mx-auto mt-8" />
        </div>

        <div className="space-y-16">
          {Object.entries(groupedColors).map(([category, categoryColors]) => (
            <div key={category}>
              <h3 className="text-2xl font-light tracking-wide text-[#124F62] dark:text-white mb-8 uppercase" style={{ letterSpacing: '0.1em' }}>
                {category} Colors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryColors.map((color) => (
                  <div key={color.name} className="group">
                    <div
                      className={`h-32 ${color.class} mb-4 transition-transform group-hover:scale-[1.02] rounded-lg shadow-sm`}
                      role="img"
                      aria-label={`Color swatch for ${color.name}`}
                    />
                    <p className="text-sm font-light text-[#0E1A1C] dark:text-white tracking-wide">{color.name}</p>
                    <p className="text-xs font-light text-black/50 dark:text-white/50 font-mono">{color.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Real Estate Investment Stats
const InvestmentStats = () => {
  const stats = [
    { value: '€45M', label: 'Capital Raised', description: 'Total invested across projects' },
    { value: '1,250+', label: 'Active Shareholders', description: 'Trusted investors' },
    { value: '23', label: 'Completed Projects', description: 'Successfully delivered' },
    { value: '7.3%', label: 'Average Annual Return', description: 'Consistent performance' },
  ];

  return (
    <section id="stats" className="py-32 px-6 bg-gradient-to-r from-[#124F62] to-[#0C3C4A] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2
            className="text-5xl font-normal tracking-tight mb-6"
            style={{ fontFamily: '"EB Garamond", serif' }}
          >
            Performance Metrics
          </h2>
          <p className="text-lg font-light opacity-80 max-w-2xl mx-auto">
            Transparent results that demonstrate our commitment to shareholder value
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/5 backdrop-blur rounded-lg p-8 hover:bg-white/10 transition-all duration-300">
                <p
                  className="text-4xl font-light tracking-tight mb-3 text-white"
                  style={{ fontFamily: '"EB Garamond", serif' }}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-light tracking-wider uppercase opacity-90 mb-2" style={{ letterSpacing: '0.1em' }}>
                  {stat.label}
                </p>
                <p className="text-xs font-light opacity-60 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Oblinor Design Showcase
const DesignShowcase = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0C3C4A] transition-colors">
      <ScandinavianNav />
      <HeroSection />
      <VisionGrid />
      <TypographyShowcase />
      <OblinorColorSystem />
      <InvestmentStats />

      {/* CSS for prefers-reduced-motion and smooth scrolling */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .transition-colors,
          .transition-transform,
          .transition-opacity,
          .duration-300,
          .duration-500 {
            transition: none;
          }
          .group-hover\\:scale-105:hover,
          .group-hover\\:scale-\\[1\\.02\\]:hover,
          .hover\\:scale-\\[1\\.02\\]:hover {
            transform: none;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default DesignShowcase;