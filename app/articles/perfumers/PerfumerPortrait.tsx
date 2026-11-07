"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { TopPerfumerProfile } from "@/lib/data/topPerfumerProfiles";

export default function PerfumerPortrait({ profile, priority = false }: {
  profile: Pick<TopPerfumerProfile, "name" | "portraitUrl" | "portraitPosition">;
  priority?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { t } = useLanguage();
  const copy = t.articles.perfumers.directory;
  useEffect(() => {
    // An eager image can fail before hydration attaches its error handler.
    if (imageRef.current?.complete && imageRef.current.naturalWidth === 0) {
      setFailedUrl(profile.portraitUrl);
    }
  }, [profile.portraitUrl]);
  return (
    <>
      {failedUrl === profile.portraitUrl ? (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-[color:var(--public-ink-primary,#f2ddb1)]">
          <span className="font-articles-heading text-2xl">{profile.name}</span>
          <span className="text-sm">{copy.portraitUnavailable}</span>
        </div>
      ) : (
        // Portraits remain on the cited publisher's host; do not copy them into the product-photo library.
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imageRef} key={profile.portraitUrl} src={profile.portraitUrl} alt={copy.portrait(profile.name)}
          onError={() => setFailedUrl(profile.portraitUrl)} loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          style={{ objectPosition: profile.portraitPosition }}
          className="absolute inset-0 h-full w-full object-cover object-center" />
      )}
    </>
  );
}
