import Link from 'next/link';
import FragranceLogo from './FragranceLogo';

export default function SiteLogo({ href = '/', imageSrc }: { href?: '/' | '/studio'; imageSrc?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center">
      <div className="flex-shrink-0">
        <FragranceLogo size="navbar" imageSrc={imageSrc} />
      </div>
    </Link>
  );
}
