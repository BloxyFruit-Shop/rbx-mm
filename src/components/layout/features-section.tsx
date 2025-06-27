"use client";

import { Shield, UserCheck, LineChart, ThumbsUp } from "lucide-react";
import { FeatureCard } from "~/components/cards/feature-card";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('home.features');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: t('trading.title'),
      description: t('trading.description'),
      icon: <Shield className="size-10" />,
      href: "/",
      variant: "short" as const,
    },
    {
      title: t('middlemen.title'),
      description: t('middlemen.description'),
      icon: <UserCheck className="size-10" />,
      href: "/",
      variant: "tall" as const,
    },
    {
      title: t('values.title'),
      description: t('values.description'),
      icon: <LineChart className="size-10" />,
      href: "/",
      variant: "tall" as const,
    },
    {
      title: t('reviews.title'),
      description: t('reviews.description'),
      icon: <ThumbsUp className="size-10" />,
      href: "/",
      variant: "short" as const,
    },
  ];

  return (
    <div ref={sectionRef}>
      <div
        className={`mb-16 text-center transition-all duration-300 ${isVisible ? "animate-fade-in-up" : "translate-y-8 opacity-0"}`}
      >
        <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-white/70">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`transition-all duration-100 ${
              isVisible
                ? "animate-fade-in-up translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
            style={{
              animationDelay: isVisible ? `${index * 150}ms` : "0ms",
              transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
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
