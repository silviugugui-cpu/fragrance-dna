import Image from 'next/image';

export default function FragranceLogo({ size = 'small' }: { size?: 'small' | 'large' | 'navbar' }) {
  const dims = size === 'small' ? 36 : size === 'navbar' ? 174 : 88;
  return (
    <div style={size === 'navbar' ? undefined : { width: dims, height: dims }} className={`fragrance-logo inline-block ${size === 'navbar' ? 'fragrance-logo-navbar' : ''}`}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Image
          src="/Logo/logo-only-v2/olfactive-dna-logo.svg"
          alt="OlfactiveDNA"
          fill
          className="object-contain"
          sizes={`${dims}px`}
          priority={false}
        />
      </div>
    </div>
  );
}
