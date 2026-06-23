import Link from 'next/link';
import { DNAHelixIcon } from './FragranceIcons';

type LuxuryLoginButtonProps = {
  href?: string;
  className?: string;
};

export default function LuxuryLoginButton({
  href = '/auth/sign-in',
  className = '',
}: LuxuryLoginButtonProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex h-[38px] items-center gap-2 rounded-[12px] border border-[#b8860b] bg-transparent px-4 font-home-mission text-[12px] font-medium uppercase tracking-[0.18em] text-[#d4af78] transition-all duration-300 hover:text-[#f0d28a] hover:shadow-[0_0_14px_rgba(184,134,11,0.28)] ${className}`}
      aria-label="Log into your DNA"
    >
      <DNAHelixIcon className="h-[16px] w-[16px] text-[#c79a27] transition-colors duration-500 group-hover:text-[#e5c76b]" />
      <span>Log into your DNA</span>
    </Link>
  );
}
