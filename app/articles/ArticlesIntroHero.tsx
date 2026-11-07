import Image from 'next/image';

export default function ArticlesIntroHero({
  imageSrc, title, sizes = '(min-width: 1778px) 1346px, (min-width: 1024px) calc(90vw - 254px), 90vw', unoptimized = false,
}: { imageSrc: string; title?: string; sizes?: string; unoptimized?: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-[rgba(var(--public-champagne-channels,159,123,68),0.45)]"
      style={{ backgroundColor: '#fff1d6', boxShadow: 'var(--public-panel-shadow, 0 30px 58px rgba(0,0,0,0.55))' }}
    >
      <div className="relative aspect-[2000/799.8]">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes={sizes}
          unoptimized={unoptimized}
          className="object-cover object-top"
        />
      </div>
      {title && <h1
        className="articles-intro-hero-title p-6 font-articles-heading text-[clamp(1.5rem,2.4vw,2.5rem)] leading-[1.2] md:absolute md:left-0 md:top-0 md:w-[44%] md:p-8 lg:p-10"
        style={{ color: '#30302d' }}
      >
        {title}
      </h1>}
    </div>
  );
}
