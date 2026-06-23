import Image from 'next/image';

export default function FragranceLogo({ size = 'small' }: { size?: 'small' | 'large' | 'navbar' }) {
  const dims = size === 'small' ? 36 : size === 'navbar' ? 174 : 88;
  return (
    <div style={{ width: dims, height: dims }} className="fragrance-logo inline-block">
      <div style={{ width: dims, height: dims, borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
        <Image
          src="/Logo/Logo Fragrance DNA with text.png"
          alt="FragranceDNA"
          fill
          className="object-cover"
          sizes={`${dims}px`}
          priority={false}
        />
      </div>
    </div>
  );
}
