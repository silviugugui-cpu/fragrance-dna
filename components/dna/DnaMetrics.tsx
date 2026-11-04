'use client';

import { useLanguage } from '@/lib/i18n';

type DnaMetricsProps = {
  confidence: number;
  dominantAxes: string;
  testedCount: number;
  remainingCount: number;
  stateLabel: string;
};

const CARD_BASE_CLASS = 'glass-card p-6';

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3L19 6V11C19 16 15.5 19.8 12 21C8.5 19.8 5 16 5 11V6L12 3Z" stroke="rgba(212,175,120,0.85)" strokeWidth="1.5" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="12" r="2.2" stroke="rgba(212,175,120,0.85)" strokeWidth="1.4" />
      <circle cx="18" cy="6" r="2.2" stroke="rgba(212,175,120,0.85)" strokeWidth="1.4" />
      <circle cx="18" cy="18" r="2.2" stroke="rgba(212,175,120,0.85)" strokeWidth="1.4" />
      <path d="M8 11L16 7" stroke="rgba(212,175,120,0.85)" strokeWidth="1.4" />
      <path d="M8 13L16 17" stroke="rgba(212,175,120,0.85)" strokeWidth="1.4" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 3H15" stroke="rgba(212,175,120,0.85)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 3V9L5.4 17.2C4.7 18.4 5.6 20 7 20H17C18.4 20 19.3 18.4 18.6 17.2L14 9V3" stroke="rgba(212,175,120,0.85)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="rgba(212,175,120,0.85)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="rgba(212,175,120,0.85)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.2" fill="rgba(212,175,120,0.95)" />
    </svg>
  );
}

export default function DnaMetrics({
  confidence,
  dominantAxes,
  testedCount,
  remainingCount,
  stateLabel,
}: DnaMetricsProps) {
  const { t } = useLanguage();
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className={CARD_BASE_CLASS}>
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--public-readable-text,rgba(165,185,150,0.75))]">{t.dna.metrics.confidence}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-4xl font-semibold text-[color:var(--public-readable-text,rgba(212,175,120,0.95))]">{confidence}%</p>
            <p className="mt-2 text-sm text-[color:var(--public-readable-text,rgba(190,170,140,0.74))]">{t.dna.metrics.highReliability}</p>
          </div>
          <ShieldIcon />
        </div>
      </article>

      <article className={CARD_BASE_CLASS}>
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--public-readable-text,rgba(165,185,150,0.75))]">{t.dna.metrics.dominantAxes}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl text-[color:var(--public-readable-text,rgba(212,175,120,0.95))]">{dominantAxes}</p>
            <p className="mt-2 text-sm text-[color:var(--public-readable-text,rgba(190,170,140,0.74))]">{t.dna.metrics.coreIdentity}</p>
          </div>
          <NetworkIcon />
        </div>
      </article>

      <article className={CARD_BASE_CLASS}>
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--public-readable-text,rgba(165,185,150,0.75))]">{t.dna.metrics.testInfluence}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-3xl text-[color:var(--public-readable-text,rgba(212,175,120,0.95))]">{t.dna.metrics.tested(testedCount, remainingCount)}</p>
            <p className="mt-2 text-sm text-[color:var(--public-readable-text,rgba(190,170,140,0.74))]">{t.dna.metrics.sufficientData}</p>
          </div>
          <LabIcon />
        </div>
      </article>

      <article className={CARD_BASE_CLASS}>
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--public-readable-text,rgba(165,185,150,0.75))]">{t.dna.metrics.state}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-3xl text-[color:var(--public-readable-text,rgba(212,175,120,0.95))]">{stateLabel}</p>
            <p className="mt-2 text-sm text-[color:var(--public-readable-text,rgba(190,170,140,0.74))]">{t.dna.metrics.profileCompleted}</p>
          </div>
          <TargetIcon />
        </div>
      </article>
    </section>
  );
}
