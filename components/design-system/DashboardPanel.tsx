/**
 * Dashboard Panel Component
 * Container for dashboard sections
 */

interface DashboardPanelProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function DashboardPanel({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
}: DashboardPanelProps) {
  return (
    <div className={`premium-card-dark ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 flex-1">
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default DashboardPanel;
