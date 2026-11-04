import Image from 'next/image';
import { BRAND_ASSETS } from '@/lib/branding';

export default function FragranceLogo({
  size = 'small',
  imageSrc = BRAND_ASSETS.dark.logo,
}: {
  size?: 'small' | 'large' | 'navbar';
  imageSrc?: string;
}) {
  const dims = size === 'small' ? 36 : size === 'navbar' ? 174 : 88;
  return (
    <div style={size === 'navbar' ? undefined : { width: dims, height: dims }} className={`fragrance-logo inline-block ${size === 'navbar' ? 'fragrance-logo-navbar' : ''}`}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Image
          src={imageSrc}
          alt="OlfactiveDNA"
          fill
          className="object-contain"
          sizes={`${dims}px`}
          priority={size === 'navbar'}
        />
      </div>
    </div>
  );
}
