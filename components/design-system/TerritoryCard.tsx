/**
 * Territory Card Component
 * Display fragrance territories with styling
 */

interface TerritoryCardProps {
  name: string;
  description?: string;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function TerritoryCard({
  name,
  description,
  color = '#D4AF78',
  onClick,
  className = '',
}: TerritoryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`premium-card cursor-pointer flex flex-col gap-2 ${className}`}
      style={
        {
          '--territory-color': color,
        } as React.CSSProperties
      }
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <h4 className="font-semibold text-white">{name}</h4>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
  );
}

export default TerritoryCard;
