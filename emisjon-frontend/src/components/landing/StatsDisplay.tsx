import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = end * easeOutQuart;

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  const formatNumber = (num: number) => {
    if (decimals === 0) {
      return Math.floor(num).toLocaleString();
    }
    return num.toFixed(decimals);
  };

  return (
    <span ref={ref} className="font-bold">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

interface StatItemProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  description?: string;
}

const StatItem: React.FC<StatItemProps> = ({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  description
}) => {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        <CountUp
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          duration={2500}
        />
      </div>
      <div className="text-teal-300 font-semibold text-lg mb-1">{label}</div>
      {description && (
        <div className="text-gray-400 text-sm max-w-32 mx-auto">{description}</div>
      )}
    </div>
  );
};

export const StatsDisplay: React.FC = () => {
  const stats = [
    {
      value: 25,
      label: "Companies",
      suffix: "+",
      description: "Successfully funded"
    },
    {
      value: 2.4,
      label: "Capital Raised",
      prefix: "€",
      suffix: "M",
      decimals: 1,
      description: "Total platform volume"
    },
    {
      value: 450,
      label: "Investors",
      suffix: "+",
      description: "Active on platform"
    },
    {
      value: 18.4,
      label: "Avg ROI",
      suffix: "%",
      decimals: 1,
      description: "Portfolio performance"
    }
  ];

  return (
    <div className="relative py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Platform at a Glance
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join the growing ecosystem of successful companies and investors
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
              description={stat.description}
            />
          ))}
        </div>

        {/* Decorative Line */}
        <div className="mt-16 flex items-center justify-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
          <div className="w-2 h-2 bg-teal-400 rounded-full mx-4" />
          <div className="w-32 h-px bg-gradient-to-r from-teal-400 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;