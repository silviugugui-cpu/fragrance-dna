/**
 * Insight Card Component
 * Display insights, tips, and key information
 * Used for profile insights, recommendations, etc.
 */

interface InsightCardProps {
  icon?: React.ReactNode;
  title: string;
  text: string;
  className?: string;
}

export function InsightCard({
  icon,
  title,
  text,
  className = '',
}: InsightCardProps) {
  return (
    <div className={`insight-card ${className}`}>
      {icon && <div className="insight-icon text-[rgba(var(--public-champagne-channels,212,175,55),0.8)]">{icon}</div>}
      <div className="insight-title">{title}</div>
      <div className="insight-text">{text}</div>
    </div>
  );
}

export default InsightCard;
