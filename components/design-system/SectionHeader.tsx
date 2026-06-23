/**
 * Section Header Component
 * Consistent section title and description pattern
 * Used for page sections, dashboard sections, etc.
 */

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`}>
      {label && <div className="section-label">{label}</div>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

export default SectionHeader;
