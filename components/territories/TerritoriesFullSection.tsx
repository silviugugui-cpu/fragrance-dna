'use client';

import { useEffect, useRef, useState } from 'react';
import { territories, Territory } from '@/lib/data/territories';
import { CloseGlyphIcon, ChevronRightGlyphIcon } from '@/components/design-system/FragranceIcons';
import { useLanguage } from '@/lib/i18n';
import { usePublicTheme } from '@/lib/theme/PublicThemeProvider';
import { getDiscoveryCopy } from '@/lib/i18n/discoveryCopy';

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
  const { t } = useLanguage();
  const display = t.territoryData[territory.id];
  const bgImage = TERRITORY_BACKGROUNDS[territory.id];
  return (
    <button
      id={territory.id}
      onClick={onClick}
      className={`
        territory-map-card relative flex min-w-0 scroll-mt-40 cursor-pointer flex-col overflow-hidden rounded-[16px] border text-left transition-shadow duration-300
        ${isSelected ? 'ring-2 ring-gold shadow-gold' : 'hover:shadow-gold'}
      `}
      style={{
        background: 'rgba(var(--public-surface-channels,7,8,12),0.88)',
        borderColor: 'rgba(var(--public-champagne-channels,197,160,94),0.34)'
      }}
    >
      {bgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="block aspect-[410/370] w-full shrink-0 object-cover object-center"
        />
      )}
      <div className="flex w-full min-w-0 flex-1 flex-col p-4">
      <div className="relative z-10 mb-3 flex items-start justify-between">
        <h3 className="min-h-[2.8em] text-lg font-bold text-white">{display?.name ?? territory.name}</h3>
      </div>

      <div className="relative z-10 mb-3">
        <span
          className={`
            inline-flex max-w-full rounded px-2 py-1 text-xs font-medium
            ${
              territory.intensity === 'light'
                ? 'bg-[var(--public-rose-surface,#5a1a2e)] text-[color:var(--public-rose-ink,#ffcab8)]'
                : territory.intensity === 'moderate'
                  ? 'bg-[var(--public-amber-surface,#4a2e0a)] text-[color:var(--public-ink-secondary,#ffd488)]'
                  : 'bg-[var(--public-red-surface,#4a0e0e)] text-[color:var(--public-red-ink,#ffaaaa)]'
            }
          `}
        >
          {t.territories.intensityBadge(
            territory.intensity === 'intense'
              ? t.territories.intensity.high
              : t.territories.intensity[territory.intensity] ?? territory.intensity,
          )}
        </span>
      </div>

      <p className="relative z-10 mb-4 min-h-[3.2em] line-clamp-2 text-left text-sm text-gray-400">{display?.description ?? territory.description}</p>

      <div className="relative z-10 mb-3 flex items-center justify-between">
        <span className="text-xs uppercase text-gray-500">{t.territories.card.versatility}</span>
        <div className="mx-2 h-1 min-w-2 flex-1 overflow-hidden rounded-full bg-black-600">
          <div className="h-full bg-gradient-to-r from-gold to-warm-500" style={{ width: `${territory.versatility}%` }} />
        </div>
        <span className="shrink-0 text-right text-xs font-medium text-gold">{territory.versatility}%</span>
      </div>

      <div className="relative z-10 mb-4 flex flex-wrap gap-2">
        {territory.dnaAxes.map((axis) => (
          <span key={axis} className="rounded border border-gold-700 bg-black-700 px-2 py-1 text-xs text-gold">
            {t.common.axes[axis] ?? axis}
          </span>
        ))}
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap gap-1">
        {['spring', 'summer', 'fall', 'winter'].map((season) => (
          <span
            key={season}
            className={`
              rounded-sm px-2 py-1 text-xs
              ${territory.season.includes(season) ? 'bg-gold-700 font-medium text-black' : 'bg-black-700 text-gray-600'}
            `}
          >
            {(t.territories.seasonsShort[season] ?? season.slice(0, 3)).toUpperCase()}
          </span>
        ))}
      </div>
      </div>
    </button>
  );
}

interface TerritoryDetailProps {
  territory: Territory;
  onClose: () => void;
}

function TerritoryDetailPanel({ territory, onClose }: TerritoryDetailProps) {
  const { t } = useLanguage();
  const display = t.territoryData[territory.id];
  const bgImage = TERRITORY_BACKGROUNDS[territory.id];
  const intensityBadge =
    territory.intensity === 'light'
      ? 'bg-[var(--public-rose-surface,#5a1a2e)] text-[color:var(--public-rose-ink,#ffcab8)]'
      : territory.intensity === 'moderate'
        ? 'bg-[var(--public-amber-surface,#4a2e0a)] text-[color:var(--public-ink-secondary,#ffd488)]'
        : 'bg-[var(--public-red-surface,#4a0e0e)] text-[color:var(--public-red-ink,#ffaaaa)]';
  const intensityLabel =
    territory.intensity === 'intense'
      ? t.territories.intensity.high
      : t.territories.intensity[territory.intensity] ?? territory.intensity;

  return (
    <div
      className="relative overflow-hidden rounded-[30px] border border-gold/35 bg-[var(--public-surface,#0a0a0c)]"
      style={{ boxShadow: 'var(--public-panel-shadow, 0 26px 54px rgba(0,0,0,0.5), inset 0 1px 0 rgba(var(--public-champagne-channels,255,226,162),0.14))' }}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-gold/45 bg-black/60 p-2 transition-colors hover:border-gold hover:bg-black/85"
        aria-label={t.territories.detail.closeDetails}
      >
        <CloseGlyphIcon className="h-5 w-5 text-white" />
      </button>

      <div className="grid gap-6 p-6 md:grid-cols-[minmax(260px,400px)_minmax(0,1fr)] md:gap-10 md:p-8">
        {/* Territory artwork displayed near its native ~410x370 resolution to stay sharp */}
        <div className="mx-auto w-full max-w-[410px] md:mx-0">
          <div className="overflow-hidden rounded-[22px] border border-gold/30 shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
            {bgImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImage} alt={t.territories.detail.artworkAlt(display?.name ?? territory.name)} className="aspect-[410/370] w-full object-cover" />
            ) : (
              <div className="aspect-[410/370] w-full" style={{ backgroundColor: territory.color }} />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className={`inline-block rounded px-3 py-1 text-sm font-medium ${intensityBadge}`}>{t.territories.intensityBadge(intensityLabel)}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500">{t.territories.card.versatility}</span>
              <span className="text-lg font-bold text-gold">{territory.versatility}%</span>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black-700">
            <div className="h-full bg-gradient-to-r from-gold to-warm-500" style={{ width: `${territory.versatility}%` }} />
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="pr-10 text-3xl font-bold text-white md:text-4xl">{display?.name ?? territory.name}</h2>
          <p className="mt-1 text-gold">{display?.name ? display.name.toUpperCase() : territory.label}</p>
          <p className="mt-4 text-base leading-relaxed text-gray-300">{display?.description ?? territory.description}</p>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <div className="space-y-8">
              <section>
                <h3 className="mb-4 text-lg font-bold text-gold">{t.territories.detail.characteristics}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(display?.characteristics ?? territory.characteristics).map((char) => (
                    <div key={char} className="flex items-start gap-3">
                      <span className="mt-1 text-gold">•</span>
                      <span className="text-gray-300">{char}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-lg font-bold text-gold">{t.territories.detail.dnaAxes}</h3>
                <div className="flex flex-wrap gap-2">
                  {territory.dnaAxes.map((axis) => (
                    <span key={axis} className="rounded-lg border border-gold bg-black-700 px-4 py-2 text-sm font-medium text-gold">
                      {t.common.axes[axis] ?? axis}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="mb-4 text-lg font-bold text-gold">{t.territories.detail.signatureFragrances}</h3>
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
                <h3 className="mb-3 text-sm font-bold uppercase text-gold">{t.territories.detail.seasons}</h3>
                <div className="flex flex-wrap gap-2">
                  {territory.season.map((season) => (
                    <span key={season} className="rounded bg-gold-900 px-3 py-1 text-sm text-gold-200">
                      {t.territories.seasons[season] ?? season.charAt(0).toUpperCase() + season.slice(1)}
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

export default function TerritoriesFullSection({ embedded = false }: { embedded?: boolean }) {
  const { locale, t } = useLanguage();
  const copy = getDiscoveryCopy(locale);
  const { assets, theme } = usePublicTheme();
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

  // Embedded mode fills the parent column (e.g. the articles content area) instead of centering at 90vw.
  const sectionWidth = embedded ? 'w-full' : 'mx-auto w-[90vw] max-w-[1600px]';

  return (
    <>
      <section className={`relative z-10 ${sectionWidth} ${embedded ? '' : 'mt-6 lg:mt-7'} pb-4 md:pb-6`}>
        <div
          className="relative overflow-hidden rounded-[30px] bg-black p-0"
          style={{
            border: '1px solid rgba(var(--public-champagne-channels,197,160,94),0.5)',
            boxShadow: 'var(--public-panel-shadow, 0 26px 54px rgba(0,0,0,0.58), inset 0 1px 0 rgba(var(--public-champagne-channels,255,226,162),0.2), inset 0 -1px 0 rgba(var(--public-champagne-channels,255,235,194),0.08))',
          }}
        >
          <div className="relative grid min-h-[640px] grid-rows-[auto_1fr] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assets.territoryHero} alt={t.territories.backgroundAlt} className="absolute inset-0 block h-full w-full object-cover" />
            <div
              className="relative z-10 col-start-1 row-start-2 mx-auto w-full max-w-3xl self-end px-5 py-6 text-center md:px-8 md:py-10"
              style={{ color: theme === 'normal' ? '#30302d' : '#f5dfc5', textShadow: theme === 'normal' ? '0 1px 4px #fff, 0 1px 2px #fff' : '0 2px 6px #000, 0 1px 3px #000' }}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em]">{t.territories.fullSection.kicker}</p>
              <h2 className="text-3xl font-semibold leading-tight md:text-5xl" style={{ textShadow: 'inherit' }}>
                {embedded ? copy.explained : copy.guide}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg">
                {t.territories.fullSection.subtitle}
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed">{copy.editorialHelp}</p>
            </div>
          <div className="relative z-10 col-start-1 row-start-1 px-5 py-6 text-center md:px-8 md:py-8 lg:px-10 lg:py-10">
            <div className="mx-auto grid min-w-0 grid-cols-2 gap-2 sm:gap-5">
              <div className="territory-filter-panel min-w-0 rounded-[22px] border border-[rgba(197,160,94,0.2)] bg-black/50 p-2 shadow-[0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-4 md:p-5">
                <p className="mb-3 break-words text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--public-ink-secondary,#d9c299)] sm:tracking-[0.22em]">{t.territories.filters.byIntensity}</p>
                <div className="flex flex-wrap justify-center gap-2 [&>button]:min-h-[44px] [&>button]:max-w-full [&>button]:break-words">
                  <button
                    onClick={() => setFilterIntensity(null)}
                    aria-pressed={filterIntensity === null}
                    className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                      filterIntensity === null ? 'bg-gold text-black' : 'border border-[rgba(197,160,94,0.45)] bg-black/75 text-gold hover:border-[rgba(197,160,94,0.72)]'
                    }`}
                  >
                    {t.territories.filters.all}
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
                      {intensity === 'intense' ? t.territories.intensity.high : t.territories.intensity[intensity] ?? intensity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="territory-filter-panel min-w-0 rounded-[22px] border border-[rgba(197,160,94,0.2)] bg-black/50 p-2 shadow-[0_18px_36px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-4 md:p-5">
                <p className="mb-3 break-words text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--public-ink-secondary,#d9c299)] sm:tracking-[0.22em]">{t.territories.filters.bySeason}</p>
                <div className="flex flex-wrap justify-center gap-2 [&>button]:min-h-[44px] [&>button]:max-w-full [&>button]:break-words">
                  <button
                    onClick={() => setFilterSeason(null)}
                    aria-pressed={filterSeason === null}
                    className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                      filterSeason === null ? 'bg-gold text-black' : 'border border-[rgba(197,160,94,0.45)] bg-black/75 text-gold hover:border-[rgba(197,160,94,0.72)]'
                    }`}
                  >
                    {t.territories.filters.all}
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
                      {t.territories.seasonsShort[season] ?? season.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`relative z-10 ${sectionWidth} pt-10 md:pt-14`}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
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
        className={`relative z-10 ${sectionWidth} scroll-mt-28 ${selectedTerritory ? 'pt-6 md:pt-8' : ''} pb-10 md:pb-14`}
      >
        {selectedTerritory && (
          <TerritoryDetailPanel territory={selectedTerritory} onClose={() => setSelectedTerritoryId(null)} />
        )}
      </section>
    </>
  );
}
