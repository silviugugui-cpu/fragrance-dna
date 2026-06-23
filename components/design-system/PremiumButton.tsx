/**
 * Premium Button Component
 * Luxury button with multiple variants for different contexts
 */

interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function PremiumButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: PremiumButtonProps) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="animate-spin">⌛</span>}
      {icon && !isLoading && <span>{icon}</span>}
      {children}
    </button>
  );
}

export default PremiumButton;
