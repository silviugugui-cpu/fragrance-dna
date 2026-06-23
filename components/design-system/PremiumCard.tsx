/**
 * Premium Card Component
 * Base card container with luxury styling
 * Used for content boxes, information displays, etc.
 */

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  hover?: boolean;
}

export function PremiumCard({
  children,
  className = '',
  variant = 'light',
  hover = true,
}: PremiumCardProps) {
  const baseClass = variant === 'dark' ? 'premium-card-dark' : 'premium-card';
  const hoverClass = hover ? 'hover:shadow-gold' : '';

  return <div className={`${baseClass} ${hoverClass} ${className}`}>{children}</div>;
}

export default PremiumCard;
