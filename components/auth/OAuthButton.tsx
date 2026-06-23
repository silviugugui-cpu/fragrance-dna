'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { AppleGlyphIcon, SearchLensIcon } from '@/components/design-system/FragranceIcons';

export interface OAuthButtonProps {
  provider: 'google' | 'apple';
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function OAuthButton({
  provider,
  variant = 'secondary',
  size = 'md',
  fullWidth = true,
  disabled = false,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'apple') {
        await signInWithApple();
      }
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses =
    'flex items-center justify-center gap-3 font-medium transition-all duration-300 rounded-lg border border-transparent';

  const sizeClasses = {
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  const variantClasses = {
    primary:
      'bg-gold hover:bg-opacity-90 text-black hover:shadow-lg hover:shadow-gold/30',
    secondary:
      'bg-black/40 hover:bg-black/60 border border-gold/30 hover:border-gold/60 text-white hover:shadow-lg hover:shadow-gold/30',
  };

  const providerConfig = {
    google: {
      icon: <SearchLensIcon className="h-5 w-5 text-[#D4AF37]/80" />,
      label: 'Continue with Google',
      bgGradient: '',
    },
    apple: {
      icon: <AppleGlyphIcon className="h-5 w-5 text-[#D4AF37]/80" />,
      label: 'Continue with Apple',
      bgGradient: '',
    },
  };

  const config = providerConfig[provider];

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${config.bgGradient}`}
    >
      <span className="text-xl">{config.icon}</span>
      <span>{isLoading ? 'Connecting...' : config.label}</span>
    </button>
  );
}
