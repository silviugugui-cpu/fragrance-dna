'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  HeroSection,
  PremiumButton,
  StatCard,
  InsightCard,
  DNAChartCard,
  SectionHeader,
  PageShell,
} from '@/components/design-system';
import FragranceLogo from './components/FragranceLogo';

// Placeholder DNA visualization for the hero
function HeroDNAVisualization() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Simplified DNA helix visualization - placeholder for future hero asset */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer rings */}
        <div className="absolute inset-0 rounded-full border border-gold-600 opacity-30" />
        <div
          className="absolute inset-4 rounded-full border border-gold-600 opacity-20"
          style={{ animation: 'spin 20s linear infinite' }}
        />
        <div className="absolute inset-8 rounded-full border border-gold-600 opacity-10" />

        {/* Center helix representation */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="text-4xl">🧬</div>
          <div className="text-center">
            <p className="text-xs text-gold-600 uppercase tracking-widest">
              Olfactory DNA
            </p>
            <p className="text-sm text-gray-400 mt-1">Awaiting activation</p>
          </div>
        </div>

        {/* Decorative particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-600"
            style={{
              left: `${50 + 40 * Math.cos((i * Math.PI) / 3)}%`,
              top: `${50 + 40 * Math.sin((i * Math.PI) / 3)}%`,
              opacity: 0.5 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Right panel with DNA preview
function DNADashboardPreview() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Profile Maturity */}
      <div className="stat-card">
        <div className="stat-label">PROFILE MATURITY</div>
        <div className="stat-value">0%</div>
        <div className="w-full bg-black-600 rounded-full h-1 mt-2">
          <div
            className="h-1 rounded-full bg-gold-600"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Top Territories */}
      <div className="insight-card">
        <div className="insight-title">TOP TERRITORIES</div>
        <div className="space-y-2">
          <div className="text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Fresh</span>
              <span className="text-gold-600">—</span>
            </div>
          </div>
          <div className="text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Pending</span>
              <span className="text-gold-600">—</span>
            </div>
          </div>
          <div className="text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Discovery</span>
              <span className="text-gold-600">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Discovery */}
      <div className="insight-card">
        <div className="insight-title">NEXT STEP</div>
        <div className="insight-text">
          Begin grounding to calibrate your olfactory profile and unlock personalized discovery.
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <PageShell>
      <main className="page-content">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24">
          <div className="main-container">
            <HeroSection
              left={
                <div className="flex flex-col gap-6 justify-center py-8">
                  {/* Logo */}
                  <div className="flex items-center gap-3 -ml-3">
                    <FragranceLogo size="small" />
                  </div>

                  {/* Headline */}
                  <div className="space-y-3">
                    <h1 className="text-5xl lg:text-6xl font-light tracking-tight">
                      Your Fragrance Identity,{' '}
                      <span className="dna-script-font text-gold-600">Decoded.</span>
                    </h1>
                  </div>

                  {/* Mission Statement */}
                  <div className="space-y-3 pt-4">
                    <h2 className="text-xl font-light text-white">
                      Understand people first. Fragrances second.
                    </h2>
                    <p className="text-gray-400 max-w-md leading-relaxed">
                      We reveal your olfactory DNA through science, data and discovery. Not
                      recommendations. Not rankings. Only clarity.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Link href="/grounding" className="w-full sm:w-auto">
                      <PremiumButton variant="primary" size="lg" className="w-full">
                        START DISCOVERY →
                      </PremiumButton>
                    </Link>
                    <Link href="/collection" className="w-full sm:w-auto">
                      <PremiumButton variant="secondary" size="lg" className="w-full">
                        VIEW COLLECTION
                      </PremiumButton>
                    </Link>
                  </div>
                </div>
              }
              center={<HeroDNAVisualization />}
              right={<DNADashboardPreview />}
              className="py-12"
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-t border-black-600">
          <div className="main-container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon="🧬"
                label="OLFACTORY ATTRIBUTES"
                value="68"
                subtitle="Mapped to your identity"
              />
              <StatCard
                icon="🎯"
                label="DIAGNOSTIC BENCHMARKS"
                value="28"
                subtitle="Reveal your preferences"
              />
              <StatCard
                icon="📊"
                label="DNA AXES"
                value="11"
                subtitle="Dimensions of identity"
              />
              <StatCard
                icon="∞"
                label="POSSIBILITIES"
                value="∞"
                subtitle="One identity, infinite expressions"
              />
            </div>
          </div>
        </section>

        {/* Territories Preview Section */}
        <section className="py-16 border-t border-black-600">
          <div className="main-container">
            <SectionHeader
              label="EXPLORE"
              title="Olfactory Territories"
              description="Discover the fragrance territories that define your olfactory universe"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Fresh Citrus', color: '#E8D966' },
                { name: 'Green Fresh', color: '#9ACD32' },
                { name: 'Luxury Fresh', color: '#87CEEB' },
                { name: 'Honey Tobacco', color: '#CD853F' },
                { name: 'Rich Gourmand', color: '#D2691E' },
                { name: 'Leather', color: '#8B4513' },
              ].map((territory) => (
                <div key={territory.name} className="premium-card group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: territory.color }}
                    />
                    <h3 className="text-white font-semibold">{territory.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Explore this territory
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/territories">
                <PremiumButton variant="secondary">VIEW ALL TERRITORIES</PremiumButton>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t border-black-600">
          <div className="main-container">
            <div className="premium-card-dark p-12 text-center">
              <h2 className="text-3xl font-semibold text-white mb-4">
                Ready to discover your olfactory identity?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Begin with grounding — our calibration experience that reveals your fragrance
                preferences, territory affinities, and DNA signature.
              </p>
              <Link href="/grounding">
                <PremiumButton variant="primary" size="lg">
                  START GROUNDING →
                </PremiumButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
