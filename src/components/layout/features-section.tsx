"use client";

import { Shield, UserCheck, LineChart, ThumbsUp } from "lucide-react";
import { FeatureCard } from "~/components/cards/feature-card";
import { useEffect, useRef, useState } from "react";

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Secure Trading",
      description: "Trade with confidence using our verified escrow system and trusted middlemen.",
      icon: <Shield className="size-10" />,
      href: "/",
      variant: "short" as const,
    },
    {
      title: "Expert Middlemen",
      description: "Verified moderators with 1000+ successful trades ready to assist you 24/7.",
      icon: <UserCheck className="size-10" />,
      href: "/",
      variant: "tall" as const,
    },
    {
      title: "Live Item Values",
      description: "Real-time market prices updated hourly to ensure you get the best deals.",
      icon: <LineChart className="size-10" />,
      href: "/",
      variant: "tall" as const,
    },
    {
      title: "Trusted Reviews",
      description: "Read verified feedback from our community of 50,000+ active traders.",
      icon: <ThumbsUp className="size-10" />,
      href: "/",
      variant: "short" as const,
    },
  ];

  return (
    <div ref={sectionRef}>
      <div className={`mb-16 text-center transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
          Why Choose Our Platform?
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-white/70">
          Everything you need for safe and profitable trading in one place
        </p>
      </div>

      <div className="grid items-center grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`transition-all duration-100 ${
              isVisible 
                ? 'animate-fade-in-up opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
            style={{ 
              animationDelay: isVisible ? `${index * 150}ms` : '0ms',
              transitionDelay: isVisible ? `${index * 150}ms` : '0ms'
            }}
          >
            <FeatureCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              href={feature.href}
              variant={feature.variant}
            />
          </div>
        ))}
      </div>
    </div>
  );
}