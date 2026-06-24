import Link from 'next/link';

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
      className={`inline-flex h-[38px] items-center rounded-[12px] border border-[#b8860b] bg-transparent px-4 font-home-mission text-[12px] font-medium uppercase tracking-[0.18em] text-[#d4af78] transition-all duration-300 hover:text-[#f0d28a] hover:shadow-[0_0_14px_rgba(184,134,11,0.28)] ${className}`}
      aria-label="Sign into your DNA"
    >
      <span>Sign into your DNA</span>
    </Link>
  );
}
