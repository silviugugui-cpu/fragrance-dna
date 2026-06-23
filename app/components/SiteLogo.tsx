import Link from 'next/link';
import FragranceLogo from './FragranceLogo';

export default function SiteLogo() {
  return (
    <Link href="/" className="group inline-flex items-center">
      <div className="flex-shrink-0">
        <FragranceLogo size="navbar" />
      </div>
    </Link>
  );
}
