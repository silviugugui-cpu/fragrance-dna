/**
 * Premium Button Component
 * Luxury button with multiple variants for different contexts
 */

import { HourglassGlyphIcon } from './FragranceIcons';

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
  type = 'button',
  ...props
}: PremiumButtonProps) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <HourglassGlyphIcon className="h-4 w-4 text-[#D4AF37]/80" />}
      {icon && !isLoading && <span>{icon}</span>}
      {children}
    </button>
  );
}

export default PremiumButton;
