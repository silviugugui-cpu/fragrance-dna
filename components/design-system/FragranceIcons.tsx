import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function cls(className = '') {
  return `shrink-0 ${className}`.trim();
}

export function DNAHelixIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M7 4c5 0 5 16 10 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 4c-5 0-5 16-10 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.2 7.1h5.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8.6 12h6.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M9.2 16.9h5.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

export function SearchLensIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <circle cx="11" cy="11" r="5.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.2 15.2 19 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AppleGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M12.5 6.3c1.1-1.4 2.2-1.8 3.4-1.9-.1 1.2-.4 2.4-1.2 3.5-.9.9-2 1.2-3.2 1-.1-1.1.2-2.1 1-2.6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 8.2c-2.4 0-4.2 2-4.2 4.6 0 2.9 1.9 6 4.2 6s4.2-3.1 4.2-6c0-2.6-1.8-4.6-4.2-4.6Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
    </svg>
  );
}

export function HourglassGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M7 4.8h10M7 19.2h10" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M8.4 5.2c0 2.8 1.6 4 3.6 6.8 2-2.8 3.6-4 3.6-6.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 18.8c0-2.8 1.6-4 3.6-6.8 2 2.8 3.6 4 3.6 6.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckSealIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.2 12.3 10.7 14.7 15.8 9.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <rect x="6.2" y="10.4" width="11.6" height="8.4" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 10.4V8.6a3.5 3.5 0 0 1 7 0v1.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <circle cx="12" cy="14.6" r="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M12 15.6v1.8" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

export function AscendGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M6.5 16.5 11 12l2.8 2.8L18.5 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.9 9H18.5v3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DescendGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M6.5 7.5 11 12l2.8-2.8 4.7 4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.9 14H18.5v-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompatibilityRingIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <circle cx="9" cy="12" r="5.4" stroke="currentColor" strokeWidth="1.45" opacity="0.9" />
      <circle cx="15" cy="12" r="5.4" stroke="currentColor" strokeWidth="1.45" opacity="0.55" />
    </svg>
  );
}

export function InsightSparkIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M12 4.8v3.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M12 15.9v3.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M4.8 12h3.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M15.9 12h3.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function CloseGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M6.8 6.8 17.2 17.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
      <path d="M17.2 6.8 6.8 17.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M9 6.5 15.2 12 9 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArchiveCabinetIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <rect x="5" y="4.8" width="14" height="14.4" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M8 13h8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

export function BottleOutlineIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M10 4.5h4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M9.2 6.2h5.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.3 6.2v2.2c-1.8 1.2-3 3.1-3 5.4v3.9c0 1.1.9 2 2 2h5.4c1.1 0 2-.9 2-2v-3.9c0-2.3-1.2-4.2-3-5.4V6.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HouseSealIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M4.5 11.2 12 5.2l7.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.2 10.6V18h9.6v-7.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18v-4h4v4" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.15" opacity="0.55" />
    </svg>
  );
}

export function BarChartGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M5 19.5h14" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.75" />
      <rect x="6" y="11" width="2.6" height="8.5" rx="0.9" stroke="currentColor" strokeWidth="1.45" />
      <rect x="10.7" y="7" width="2.6" height="12.5" rx="0.9" stroke="currentColor" strokeWidth="1.45" />
      <rect x="15.4" y="9.4" width="2.6" height="10.1" rx="0.9" stroke="currentColor" strokeWidth="1.45" />
    </svg>
  );
}

export function StarGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M12 4.5 13.9 9l4.8.6-3.5 3.2.9 4.7L12 15.9 7.9 17.5l.9-4.7L5.3 9.6 10.1 9 12 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function TargetGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.45" />
      <circle cx="12" cy="12" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function MapMarkerIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M12 20.2s5.2-4.5 5.2-9.2A5.2 5.2 0 1 0 6.8 11c0 4.7 5.2 9.2 5.2 9.2Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <circle cx="12" cy="10.8" r="1.6" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function CompassRoseIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 5.6V8.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 15.9v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.6 12H8.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.9 12h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.2 14.8 12 7.9l2.8 6.9-6.9-2.8Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function CrystalGlyphIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls(className)} {...props}>
      <path d="M12 4.6 16.9 8v8L12 19.4 7.1 16V8L12 4.6Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M12 4.6v14.8" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.7" />
      <path d="M7.1 8 12 12l4.9-4" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}