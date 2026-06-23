import Link from 'next/link';
import FragranceLogo from './FragranceLogo';

export default function SiteLogo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <div className="relative h-12 w-12 flex items-center justify-center overflow-hidden rounded-full border border-[rgba(199,168,107,0.24)]">
        <FragranceLogo size="small" />
      </div>
      <div className="hidden sm:flex flex-col leading-none">
        <span className="text-xs dna-script-font tracking-[0.42em] text-[rgba(212,175,120,0.95)]">Fragrance</span>
        <span className="text-2xl font-semibold text-white">DNA</span>
      </div>
    </Link>
  );
}
