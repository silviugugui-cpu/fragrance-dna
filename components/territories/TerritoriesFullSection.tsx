'use client';

import { useEffect, useRef, useState } from 'react';
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
  const bgImage = TERRITORY_BACKGROUNDS[territory.id];
  const intensityBadge =
    territory.intensity === 'light'
      ? 'bg-[#5a1a2e] text-[#ffcab8]'
      : territory.intensity === 'moderate'
        ? 'bg-[#4a2e0a] text-[#ffd488]'
        : 'bg-[#4a0e0e] text-[#ffaaaa]';
  const intensityLabel =
    territory.intensity === 'intense' ? 'High' : territory.intensity.charAt(0).toUpperCase() + territory.intensity.slice(1);

  return (
    <div
      className="relative overflow-hidden rounded-[30px] border border-gold/35 bg-[#0a0a0c]"
      style={{ boxShadow: '0 26px 54px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,226,162,0.14)' }}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-gold/45 bg-black/60 p-2 transition-colors hover:border-gold hover:bg-black/85"
        aria-label="Close territory details"
      >
        <CloseGlyphIcon className="h-5 w-5 text-white" />
      </button>

      <div className="grid gap-6 p-6 md:grid-cols-[minmax(260px,400px)_minmax(0,1fr)] md:gap-10 md:p-8">
        {/* Territory artwork displayed near its native ~410x370 resolution to stay sharp */}
        <div className="mx-auto w-full max-w-[410px] md:mx-0">
          <div className="overflow-hidden rounded-[22px] border border-gold/30 shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
            {bgImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImage} alt={`${territory.name} territory artwork`} className="aspect-[410/370] w-full object-cover" />
            ) : (
              <div className="aspect-[410/370] w-full" style={{ backgroundColor: territory.color }} />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className={`inline-block rounded px-3 py-1 text-sm font-medium ${intensityBadge}`}>{intensityLabel} Intensity</span>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500">Versatility</span>
              <span className="text-lg font-bold text-gold">{territory.versatility}%</span>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black-700">
            <div className="h-full bg-gradient-to-r from-gold to-warm-500" style={{ width: `${territory.versatility}%` }} />
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="pr-10 text-3xl font-bold text-white md:text-4xl">{territory.name}</h2>
          <p className="mt-1 text-gold">{territory.label}</p>
          <p className="mt-4 text-base leading-relaxed text-gray-300">{territory.description}</p>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <div className="space-y-8">
              <section>
                <h3 className="mb-4 text-lg font-bold text-gold">CHARACTERISTICS</h3>
                <div className="grid grid-cols-1 gap-3">
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
            </div>

            <div className="space-y-8">
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

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase text-gold">SEASONS</h3>
                <div className="flex flex-wrap gap-2">
                  {territory.season.map((season) => (
                    <span key={season} className="rounded bg-gold-900 px-3 py-1 text-sm text-gold-200">
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TerritoriesFullSection() {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [filterIntensity, setFilterIntensity] = useState<string | null>(null);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);

  // Bring the expanded detail into view when a territory is selected.
  useEffect(() => {
    if (selectedTerritoryId && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedTerritoryId]);

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
            <img src="/Territory/Territory.png" alt="Territories background" className="absolute inset-0 h-full w-full object-cover object-[center_65%]" />
          </div>

          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.78), rgba(0,0,0,0.58), rgba(0,0,0,0.7))' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,120,0.16),transparent_42%),linear-gradient(90deg,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.14)_24%,rgba(0,0,0,0.1)_76%,rgba(0,0,0,0.4)_100%)]" />

          <div className="relative z-10 px-5 py-6 text-center md:px-8 md:py-8 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-3xl py-4 md:py-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold">Olfactory Territories</p>
              <h2 className="text-3xl font-semibold leading-tight text-[#d8c49d] drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] md:text-5xl">
                Explore the world of scent
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#f0e0bd] md:text-lg">
                Find the scent worlds that speak to you.
              </p>
            </div>

            <div className="mx-auto mt-8 flex flex-wrap items-start justify-center gap-5 md:gap-8 lg:gap-10">
              <div className="w-fit max-w-full rounded-[22px] border border-[rgba(197,160,94,0.2)] bg-black/50 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#d9c299]">Filter by Intensity</p>
                <div className="flex flex-wrap justify-center gap-2 [&>button]:min-h-[44px]">
                  <button
                    onClick={() => setFilterIntensity(null)}
                    aria-pressed={filterIntensity === null}
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
                      aria-pressed={filterIntensity === intensity}
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

              <div className="w-fit max-w-full rounded-[22px] border border-[rgba(197,160,94,0.2)] bg-black/50 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#d9c299]">Filter by Season</p>
                <div className="flex flex-wrap justify-center gap-2 [&>button]:min-h-[44px]">
                  <button
                    onClick={() => setFilterSeason(null)}
                    aria-pressed={filterSeason === null}
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
                      aria-pressed={filterSeason === season}
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

      <section className="relative z-10 mx-auto w-[90vw] max-w-[1600px] pt-10 md:pt-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filteredTerritories.map((territory) => (
            <TerritoryMapCard
              key={territory.id}
              territory={territory}
              isSelected={selectedTerritoryId === territory.id}
              onClick={() => setSelectedTerritoryId((previous) => (previous === territory.id ? null : territory.id))}
            />
          ))}
        </div>
      </section>

      {/* Expanded territory detail, inline below the cards */}
      <section
        ref={detailRef}
        className={`relative z-10 mx-auto w-[90vw] max-w-[1600px] scroll-mt-28 ${selectedTerritory ? 'pt-6 md:pt-8' : ''} pb-10 md:pb-14`}
      >
        {selectedTerritory && (
          <TerritoryDetailPanel territory={selectedTerritory} onClose={() => setSelectedTerritoryId(null)} />
        )}
      </section>
    </>
  );
}
