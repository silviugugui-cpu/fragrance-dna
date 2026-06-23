/**
 * Hero Section Component
 * Premium hero layout with left, center, and right content areas
 * Used for home page and primary landing sections
 */

interface HeroSectionProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function HeroSection({
  left,
  center,
  right,
  className = '',
  fullHeight = false,
}: HeroSectionProps) {
  return (
    <section
      className={`hero-section ${fullHeight ? 'min-h-screen' : ''} ${className}`}
    >
      {left && <div className="hero-left">{left}</div>}
      {center && <div className="hero-center">{center}</div>}
      {right && <div className="hero-right">{right}</div>}
    </section>
  );
}

export default HeroSection;
