/**
 * Stat Card Component
 * Display key metrics and statistics
 * Used on dashboards and overview sections
 */

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  className = '',
}: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}

export default StatCard;
