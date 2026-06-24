'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PremiumButton } from '@/components/design-system/PremiumButton';
import { territories, Territory } from '@/lib/data/territories';
import { CloseGlyphIcon, ChevronRightGlyphIcon } from '@/components/design-system/FragranceIcons';

const TERRITORY_BACKGROUNDS: Record<string, string> = {
  'fresh-citrus':  '/Territory/Fresh citrus.bmp',
  'green-fresh':   '/Territory/Green Fresh.bmp',
  'luxury-fresh':  '/Territory/Luxury Fresh.bmp',
  'honey-tobacco': '/Territory/Honey Tabacco.bmp',
  'rich-gourmand': '/Territory/Rich Gourmand.bmp',
  'leather':       '/Territory/Leather.bmp',
  'woody-elegant': '/Territory/Woody Elkegant.bmp',
  'amber':         '/Territory/Amber.bmp',
  'musk':          '/Territory/Musk.bmp',
  'floral':        '/Territory/Floral.bmp',
};

interface TerritoryCardProps {
  territory: Territory;
  isSelected: boolean;
  onClick: () => void;
}

function TerritoryMapCard({ territory, isSelected, onClick }: TerritoryCardProps) {
  const bgImage = TERRITORY_BACKGROUNDS[territory.id];
  return (
    <button
      onClick={onClick}
      className={`
        relative cursor-pointer overflow-hidden rounded-[16px] border p-6 transition-all duration-300
        ${isSelected ? 'ring-2 ring-gold shadow-gold scale-105' : 'hover:shadow-gold hover:scale-102'}
      `}
      style={{
        background: 'rgba(7,8,12,0.88)',
        borderColor: 'rgba(197, 160, 94, 0.34)'
      }}
    >
      {bgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/55 pointer-events-none" />

      <div className="relative z-10 mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-white">{territory.name}</h3>
      </div>

      <div className="relative z-10 mb-3">
        <span
          className={`
            rounded px-2 py-1 text-xs font-medium
            ${
              territory.intensity === 'light'
                ? 'bg-[#5a1a2e] text-[#ffcab8]'
                : territory.intensity === 'moderate'
                  ? 'bg-[#4a2e0a] text-[#ffd488]'
                  : 'bg-[#4a0e0e] text-[#ffaaaa]'
            }
          `}
        >
          {territory.intensity === 'intense' ? 'High' : territory.intensity.charAt(0).toUpperCase() + territory.intensity.slice(1)} Intensity
        </span>
      </div>

      <p className="relative z-10 mb-4 line-clamp-2 text-left text-sm text-gray-400">{territory.description}</p>

      <div className="relative z-10 mb-3 flex items-center justify-between">
        <span className="text-xs uppercase text-gray-500">Versatility</span>
        <div className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-black-600">
          <div className="h-full bg-gradient-to-r from-gold to-warm-500" style={{ width: `${territory.versatility}%` }} />
        </div>
        <span className="w-6 text-right text-xs font-medium text-gold">{territory.versatility}%</span>
      </div>

      <div className="relative z-10 mb-4 flex flex-wrap gap-2">
        {territory.dnaAxes.map((axis) => (
          <span key={axis} className="rounded border border-gold-700 bg-black-700 px-2 py-1 text-xs text-gold">
            {axis}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex gap-1">
        {['spring', 'summer', 'fall', 'winter'].map((season) => (
          <span
            key={season}
            className={`
              rounded-sm px-2 py-1 text-xs
              ${territory.season.includes(season) ? 'bg-gold-700 font-medium text-black' : 'bg-black-700 text-gray-600'}
            `}
          >
            {season.slice(0, 3).toUpperCase()}
          </span>
        ))}
      </div>
    </button>
  );
}

interface TerritoryDetailProps {
  territory: Territory;
  onClose: () => void;
}

function TerritoryDetailPanel({ territory, onClose }: TerritoryDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-900 bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="premium-card-dark relative max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-hidden rounded-[30px] border border-gold/35">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg bg-black-700 p-2 transition-colors hover:bg-black-600"
          aria-label="Close"
        >
          <CloseGlyphIcon className="h-5 w-5 text-white" />
        </button>

        <div className="border-b border-gold-900 p-8" style={{ borderTopColor: territory.color, borderTopWidth: '4px' }}>
          <div className="mb-4 flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: territory.color }} />
            <div>
              <h2 className="text-3xl font-bold text-white">{territory.name}</h2>
              <p className="mt-1 text-gold">{territory.label}</p>
            </div>
          </div>
          <p className="text-base text-gray-300">{territory.description}</p>
        </div>

        <div className="space-y-8 p-8">
          <section>
            <h3 className="mb-4 text-lg font-bold text-gold">CHARACTERISTICS</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {territory.characteristics.map((char) => (
                <div key={char} className="flex items-start gap-3">
                  <span className="mt-1 text-gold">•</span>
                  <span className="text-gray-300">{char}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-bold text-gold">DNA AXES</h3>
            <div className="flex flex-wrap gap-2">
              {territory.dnaAxes.map((axis) => (
                <span key={axis} className="rounded-lg border border-gold bg-black-700 px-4 py-2 text-sm font-medium text-gold">
                  {axis}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-bold text-gold">SIGNATURE FRAGRANCES</h3>
            <div className="space-y-2">
              {territory.examples.map((example) => (
                <div key={example} className="flex items-center gap-3 text-gray-300">
                  <ChevronRightGlyphIcon className="h-4 w-4 text-gold" />
                  {example}
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase text-gold">SEASONS</h3>
              <div className="flex flex-wrap gap-2">
                {territory.season.map((season) => (
                  <span key={season} className="rounded bg-gold-900 px-3 py-1 text-sm text-gold-200">
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase text-gold">INTENSITY</h3>
              <span
                className={`
                  inline-block rounded px-3 py-1 text-sm font-medium
                  ${
                    territory.intensity === 'light'
                      ? 'bg-[#5a1a2e] text-[#ffcab8]'
                      : territory.intensity === 'moderate'
                        ? 'bg-[#4a2e0a] text-[#ffd488]'
                        : 'bg-[#4a0e0e] text-[#ffaaaa]'
                  }
                `}
              >
                {territory.intensity === 'intense' ? 'High' : territory.intensity.charAt(0).toUpperCase() + territory.intensity.slice(1)}
              </span>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase text-gold">VERSATILITY</h3>
            <div className="flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black-700">
                <div className="h-full bg-gradient-to-r from-gold to-warm-500" style={{ width: `${territory.versatility}%` }} />
              </div>
              <span className="text-lg font-bold text-gold">{territory.versatility}%</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function TerritoriesFullSection() {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [filterIntensity, setFilterIntensity] = useState<string | null>(null);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);

  const territoryList = Object.values(territories);

  const filteredTerritories = territoryList.filter((t) => {
    if (filterIntensity && t.intensity !== filterIntensity) return false;
    if (filterSeason && !t.season.includes(filterSeason)) return false;
    return true;
  });

  const selectedTerritory = selectedTerritoryId ? territoryList.find((t) => t.id === selectedTerritoryId) : undefined;

  return (
    <>
      <section className="relative z-10 mx-auto mt-6 w-[90vw] max-w-[1600px] pb-4 lg:mt-7 md:pb-6">
        <div
          className="relative overflow-hidden rounded-[30px] bg-black p-0"
          style={{
            border: '1px solid rgba(197, 160, 94, 0.5)',
            boxShadow: '0 26px 54px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,226,162,0.2), inset 0 -1px 0 rgba(255,235,194,0.08)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[30px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Territory/Territory.png" alt="Territories background" className="absolute inset-0 h-full w-full object-cover object-center" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-black/58 to-black/82" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,120,0.16),transparent_42%),linear-gradient(90deg,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.14)_24%,rgba(0,0,0,0.1)_76%,rgba(0,0,0,0.4)_100%)]" />

          <div className="relative z-10 px-5 py-6 text-center md:px-8 md:py-8 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-5xl rounded-[28px] border border-[rgba(197,160,94,0.22)] bg-black/35 px-6 py-6 shadow-[0_22px_52px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-10 md:py-8">
              <h2 className="text-4xl font-bold leading-none text-[#d8c49d] drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] md:text-6xl">
                Olfactory Territories
              </h2>
              <p className="mt-3 text-base font-medium leading-snug text-[#f0e0bd] md:mt-4 md:text-2xl">
                DNA integration maps your territory affinity and helps you get recommendations that you will love
              </p>
            </div>

            <div className="mx-auto mt-6 grid max-w-[1500px] gap-5 text-left md:grid-cols-2 md:gap-8 lg:gap-10">
              <div className="rounded-[24px] border border-[rgba(197,160,94,0.22)] bg-black/55 px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-6 md:py-5">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.26em] text-gold">Overview</p>
                <p className="text-base leading-relaxed text-gray-100/92 md:text-lg">
                  The fragrance universe organizes into distinct territories. Each represents a unique olfactory character,
                  offering different expressions of identity, mood, and occasion.
                </p>
              </div>

              <div className="rounded-[24px] border border-[rgba(197,160,94,0.22)] bg-black/55 px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-6 md:py-5">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.26em] text-gold">How to use</p>
                <p className="text-base leading-relaxed text-gray-100/92 md:text-lg">
                  Click any territory to explore characteristics, DNA signatures, and signature fragrances.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-[1480px] grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-8 lg:gap-10">
              <div className="rounded-[22px] border border-[rgba(197,160,94,0.2)] bg-black/50 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#d9c299]">Filter by Intensity</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterIntensity(null)}
                    className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                      filterIntensity === null ? 'bg-gold text-black' : 'border border-[rgba(197,160,94,0.45)] bg-black/75 text-gold hover:border-[rgba(197,160,94,0.72)]'
                    }`}
                  >
                    All
                  </button>
                  {['light', 'moderate', 'intense'].map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setFilterIntensity(intensity)}
                      className={`rounded px-3 py-1 text-xs font-medium capitalize transition-all ${
                        filterIntensity === intensity
                          ? 'bg-gold text-black'
                          : 'border border-[rgba(197,160,94,0.26)] bg-black/75 text-gray-100 hover:border-[rgba(197,160,94,0.58)]'
                      }`}
                    >
                      {intensity === 'intense' ? 'High' : intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-[rgba(197,160,94,0.2)] bg-black/50 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#d9c299]">Filter by Season</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterSeason(null)}
                    className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                      filterSeason === null ? 'bg-gold text-black' : 'border border-[rgba(197,160,94,0.45)] bg-black/75 text-gold hover:border-[rgba(197,160,94,0.72)]'
                    }`}
                  >
                    All
                  </button>
                  {['spring', 'summer', 'fall', 'winter'].map((season) => (
                    <button
                      key={season}
                      onClick={() => setFilterSeason(season)}
                      className={`rounded px-3 py-1 text-xs font-medium capitalize transition-all ${
                        filterSeason === season
                          ? 'bg-gold text-black'
                          : 'border border-[rgba(197,160,94,0.26)] bg-black/75 text-gray-100 hover:border-[rgba(197,160,94,0.58)]'
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
      </section>

      <section className="relative z-10 mx-auto w-[90vw] max-w-[1600px] py-10 md:py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filteredTerritories.map((territory) => (
            <TerritoryMapCard
              key={territory.id}
              territory={territory}
              isSelected={selectedTerritoryId === territory.id}
              onClick={() => setSelectedTerritoryId(territory.id)}
            />
          ))}
        </div>
      </section>

      {selectedTerritory && <TerritoryDetailPanel territory={selectedTerritory} onClose={() => setSelectedTerritoryId(null)} />}
    </>
  );
}
