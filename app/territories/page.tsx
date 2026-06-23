'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PageShell } from '@/components/design-system/PageShell';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { PremiumButton } from '@/components/design-system/PremiumButton';
import { territories, Territory } from '@/lib/data/territories';

interface TerritoryCardProps {
  territory: Territory;
  isSelected: boolean;
  onClick: () => void;
}

const TerritoryMapCard: React.FC<TerritoryCardProps> = ({ territory, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        premium-card-dark relative p-6 transition-all duration-300 cursor-pointer
        ${isSelected 
          ? 'ring-2 ring-gold shadow-gold scale-105' 
          : 'hover:shadow-gold hover:scale-102'
        }
        border border-gold/25 hover:border-gold/55
      `}
    >
      {/* Territory Color Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg" style={{ backgroundColor: territory.color }} />

      {/* Territory Name */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{territory.name}</h3>
        <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: territory.color }} />
      </div>

      {/* Intensity Badge */}
      <div className="mb-3">
        <span className={`
          text-xs font-medium px-2 py-1 rounded
          ${territory.intensity === 'light' 
            ? 'bg-blue-900 text-blue-300'
            : territory.intensity === 'moderate'
            ? 'bg-warm-700 text-warm-200'
            : 'bg-red-900 text-red-300'
          }
        `}>
          {territory.intensity.charAt(0).toUpperCase() + territory.intensity.slice(1)} Intensity
        </span>
      </div>

      {/* Description Preview */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 text-left">
        {territory.description}
      </p>

      {/* Versatility Indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase">Versatility</span>
        <div className="flex-1 mx-2 h-1 bg-black-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-warm-500"
            style={{ width: `${territory.versatility}%` }}
          />
        </div>
        <span className="text-xs text-gold font-medium w-6 text-right">{territory.versatility}%</span>
      </div>

      {/* DNA Axes Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {territory.dnaAxes.map((axis) => (
          <span
            key={axis}
            className="text-xs bg-black-700 text-gold border border-gold-700 px-2 py-1 rounded"
          >
            {axis}
          </span>
        ))}
      </div>

      {/* Season Indicators */}
      <div className="flex gap-1">
        {['spring', 'summer', 'fall', 'winter'].map((season) => (
          <span
            key={season}
            className={`
              text-xs px-2 py-1 rounded-sm
              ${territory.season.includes(season)
                ? 'bg-gold-700 text-black font-medium'
                : 'bg-black-700 text-gray-600'
              }
            `}
          >
            {season.slice(0, 3).toUpperCase()}
          </span>
        ))}
      </div>
    </button>
  );
};

interface TerritoryDetailProps {
  territory: Territory;
  onClose: () => void;
}

const TerritoryDetailPanel: React.FC<TerritoryDetailProps> = ({ territory, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-900 bg-opacity-90 backdrop-blur-sm p-4">
      <div className="premium-card-dark relative max-w-2xl w-full border border-gold/35 rounded-[30px] overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black-700 hover:bg-black-600 transition-colors"
          aria-label="Close"
        >
          <span className="text-white text-2xl">×</span>
        </button>

        {/* Header */}
        <div className="p-8 border-b border-gold-900" style={{ borderTopColor: territory.color, borderTopWidth: '4px' }}>
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-lg"
              style={{ backgroundColor: territory.color }}
            />
            <div>
              <h2 className="text-3xl font-bold text-white">{territory.name}</h2>
              <p className="text-gold mt-1">{territory.label}</p>
            </div>
          </div>
          <p className="text-base text-gray-300">{territory.description}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Characteristics */}
          <section>
            <h3 className="text-lg font-bold text-gold mb-4">CHARACTERISTICS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {territory.characteristics.map((char) => (
                <div key={char} className="flex items-start gap-3">
                  <span className="text-gold mt-1">•</span>
                  <span className="text-gray-300">{char}</span>
                </div>
              ))}
            </div>
          </section>

          {/* DNA Axes */}
          <section>
            <h3 className="text-lg font-bold text-gold mb-4">DNA AXES</h3>
            <div className="flex flex-wrap gap-2">
              {territory.dnaAxes.map((axis) => (
                <span
                  key={axis}
                  className="px-4 py-2 bg-black-700 border border-gold text-gold rounded-lg text-sm font-medium"
                >
                  {axis}
                </span>
              ))}
            </div>
          </section>

          {/* Examples */}
          <section>
            <h3 className="text-lg font-bold text-gold mb-4">SIGNATURE FRAGRANCES</h3>
            <div className="space-y-2">
              {territory.examples.map((example) => (
                <div key={example} className="flex items-center gap-3 text-gray-300">
                  <span className="text-gold">›</span>
                  {example}
                </div>
              ))}
            </div>
          </section>

          {/* Season & Intensity */}
          <section className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gold mb-3 uppercase">SEASONS</h3>
              <div className="flex flex-wrap gap-2">
                {territory.season.map((season) => (
                  <span key={season} className="px-3 py-1 bg-gold-900 text-gold-200 rounded text-sm">
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gold mb-3 uppercase">INTENSITY</h3>
              <span className={`
                inline-block px-3 py-1 rounded text-sm font-medium
                ${territory.intensity === 'light' 
                  ? 'bg-blue-900 text-blue-200'
                  : territory.intensity === 'moderate'
                  ? 'bg-warm-700 text-warm-200'
                  : 'bg-red-900 text-red-200'
                }
              `}>
                {territory.intensity.charAt(0).toUpperCase() + territory.intensity.slice(1)}
              </span>
            </div>
          </section>

          {/* Versatility */}
          <section>
            <h3 className="text-sm font-bold text-gold mb-3 uppercase">VERSATILITY</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-black-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-warm-500"
                  style={{ width: `${territory.versatility}%` }}
                />
              </div>
              <span className="text-gold font-bold text-lg">{territory.versatility}%</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default function TerritoriesPage() {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [filterIntensity, setFilterIntensity] = useState<string | null>(null);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);

  const territoryList = Object.values(territories);

  const filteredTerritories = territoryList.filter((t) => {
    if (filterIntensity && t.intensity !== filterIntensity) return false;
    if (filterSeason && !t.season.includes(filterSeason)) return false;
    return true;
  });

  const selectedTerritory = selectedTerritoryId
    ? territoryList.find((t) => t.id === selectedTerritoryId)
    : undefined;

  return (
    <PageShell showBackgroundLayers>
      {/* Hero Section */}
      <section className="py-4 md:py-6">
        <div className="main-container">
          <div className="premium-card-dark relative overflow-hidden border-gold/20 p-0 min-h-[700px] md:min-h-[740px]">
            <div className="absolute inset-2 md:inset-3 overflow-hidden rounded-[28px]">
              <Image
                src="/Teritory/Teritory.png"
                alt="Territories background"
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/78" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,120,0.18),transparent_44%),linear-gradient(90deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.12)_22%,rgba(0,0,0,0.08)_78%,rgba(0,0,0,0.38)_100%)]" />

            <div className="relative z-10 flex min-h-[700px] md:min-h-[740px] items-start pt-2 md:pt-3">
              <div className="w-full max-w-5xl px-5 py-3 md:px-10 md:py-4 mx-auto text-center">
                <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-black/35 px-6 py-6 md:px-10 md:py-8 backdrop-blur-sm shadow-[0_22px_52px_rgba(0,0,0,0.35)]">
                  <h1 className="text-3xl md:text-5xl font-bold text-[#d8c49d] leading-none drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
                  Olfactory Territories
                  </h1>
                </div>

                <div className="mt-4 grid gap-3 text-left md:grid-cols-2">
                  <div className="rounded-[24px] border border-gold/18 bg-black/55 px-5 py-4 md:px-6 md:py-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-gold mb-3">Overview</p>
                    <p className="text-base md:text-lg text-gray-100/92 leading-relaxed">
                      The fragrance universe organizes into distinct territories. Each represents a unique olfactory character,
                      offering different expressions of identity, mood, and occasion.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-gold/18 bg-black/55 px-5 py-4 md:px-6 md:py-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-gold mb-3">How to use</p>
                    <p className="text-base md:text-lg text-gray-100/92 leading-relaxed">
                      Click any territory to explore characteristics, DNA signatures, and signature fragrances.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="-mt-24 pb-4 md:-mt-32 md:pb-6">
        <div className="main-container">
          <div className="premium-card-dark relative overflow-hidden border-gold/20 p-0">
            <div className="absolute inset-0">
              <Image
                src="/Teritory/Teritory.png"
                alt="Territories background"
                fill
                aria-hidden="true"
                className="object-cover object-center opacity-55"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/72 to-black/82" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,120,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(212,175,120,0.1),transparent_36%)]" />

            <div className="relative z-10 p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 items-stretch max-w-4xl mx-auto">
              {/* Filter by Intensity */}
                <div className="rounded-[22px] border border-gold/16 bg-black/50 p-4 md:p-5 backdrop-blur-md shadow-[0_18px_36px_rgba(0,0,0,0.3)]">
                <p className="text-xs font-semibold text-[#d9c299] uppercase mb-3 tracking-[0.22em]">Filter by Intensity</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterIntensity(null)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      filterIntensity === null
                        ? 'bg-gold text-black'
                        : 'bg-black/75 text-gold border border-gold/45 hover:border-gold'
                    }`}
                  >
                    All
                  </button>
                  {['light', 'moderate', 'intense'].map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setFilterIntensity(intensity)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize ${
                        filterIntensity === intensity
                          ? 'bg-gold text-black'
                          : 'bg-black/75 text-gray-100 border border-white/10 hover:border-gold'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
                </div>

              {/* Filter by Season */}
                <div className="rounded-[22px] border border-gold/16 bg-black/50 p-4 md:p-5 backdrop-blur-md shadow-[0_18px_36px_rgba(0,0,0,0.3)]">
                <p className="text-xs font-semibold text-[#d9c299] uppercase mb-3 tracking-[0.22em]">Filter by Season</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterSeason(null)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      filterSeason === null
                        ? 'bg-gold text-black'
                        : 'bg-black/75 text-gold border border-gold/45 hover:border-gold'
                    }`}
                  >
                    All
                  </button>
                  {['spring', 'summer', 'fall', 'winter'].map((season) => (
                    <button
                      key={season}
                      onClick={() => setFilterSeason(season)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize ${
                        filterSeason === season
                          ? 'bg-gold text-black'
                          : 'bg-black/75 text-gray-100 border border-white/10 hover:border-gold'
                      }`}
                    >
                      {season.slice(0, 3)}
                    </button>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Territories Grid */}
      <section className="py-10 md:py-14">
        <div className="main-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredTerritories.map((territory) => (
              <TerritoryMapCard
                key={territory.id}
                territory={territory}
                isSelected={selectedTerritoryId === territory.id}
                onClick={() => setSelectedTerritoryId(territory.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Territory Detail Panel */}
      {selectedTerritory && (
        <TerritoryDetailPanel
          territory={selectedTerritory}
          onClose={() => setSelectedTerritoryId(null)}
        />
      )}

      {/* DNA Integration Section */}
      <section className="py-10 md:py-14">
        <div className="main-container">
          <div className="premium-card-dark p-10 md:p-14 text-center">
            <p className="text-gold text-sm font-semibold uppercase mb-2">DNA INTEGRATION</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Map Your Territory Affinity
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
              Your Olfactory DNA signature maps naturally to territory affinities. Understanding which territories
              resonate with your profile guides discovery of fragrances that align with your identity.
            </p>
            <PremiumButton
              variant="primary"
              size="md"
              onClick={() => (window.location.href = '/grounding')}
            >
              DISCOVER YOUR TERRITORIES →
            </PremiumButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
