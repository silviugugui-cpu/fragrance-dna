'use client';

import { useState } from 'react';
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
        relative p-6 rounded-lg transition-all duration-300 cursor-pointer
        ${isSelected 
          ? 'ring-2 ring-gold shadow-gold scale-105' 
          : 'hover:shadow-gold hover:scale-102'
        }
        bg-black-800 border border-black-600 hover:border-gold
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
      <div className="relative max-w-2xl w-full bg-black-800 border border-gold rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
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
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gold text-sm font-semibold uppercase mb-2">EXPLORE</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Olfactory Territories
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            The fragrance universe organizes into distinct territories. Each represents a unique olfactory character,
            offering different expressions of identity, mood, and occasion.
          </p>
          <p className="text-base text-gray-500">
            Click any territory to explore characteristics, DNA signatures, and signature fragrances.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-y border-gold-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            {/* Filter by Intensity */}
            <div>
              <p className="text-xs font-semibold text-gold uppercase mb-3">Filter by Intensity</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterIntensity(null)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    filterIntensity === null
                      ? 'bg-gold text-black'
                      : 'bg-black-700 text-gold border border-gold hover:border-gold-600'
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
                        : 'bg-black-700 text-gray-400 border border-black-600 hover:border-gold'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Season */}
            <div>
              <p className="text-xs font-semibold text-gold uppercase mb-3">Filter by Season</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterSeason(null)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    filterSeason === null
                      ? 'bg-gold text-black'
                      : 'bg-black-700 text-gold border border-gold hover:border-gold-600'
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
                        : 'bg-black-700 text-gray-400 border border-black-600 hover:border-gold'
                    }`}
                  >
                    {season.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {filteredTerritories.length} territories found
          </p>
        </div>
      </section>

      {/* Territories Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
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
      <section className="py-16 md:py-24 border-t border-gold-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gold text-sm font-semibold uppercase mb-2">DNA INTEGRATION</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Map Your Territory Affinity
          </h2>
          <p className="text-lg text-gray-400 mb-8">
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
      </section>
    </PageShell>
  );
}
