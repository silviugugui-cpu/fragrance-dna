/**
 * DNA Chart Card Component
 * Container for DNA radar charts and other visualizations
 */

interface DNAChartCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function DNAChartCard({
  title,
  subtitle,
  children,
  className = '',
}: DNAChartCardProps) {
  return (
    <div className={`premium-card-dark ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6 flex flex-col gap-1">
          {title && <h3 className="text-xl font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      )}
      <div className="chart-container">{children}</div>
    </div>
  );
}

export default DNAChartCard;
