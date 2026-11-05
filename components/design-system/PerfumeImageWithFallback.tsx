'use client';

import { useState } from 'react';
import { normalizePerfumeImagePath, PERFUME_FALLBACK_IMAGE_SRC } from '@/lib/design/perfumeImage';

export interface PerfumeImageWithFallbackProps {
  /** Image sources to try in priority order (empty values are skipped). */
  candidates: Array<string | null | undefined>;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

// Tries each candidate source in order and ends at the shared fallback artwork.
// Local originals are not deployed; published Blob photos should be first.
export function PerfumeImageWithFallback({
  candidates,
  alt,
  className,
  loading = 'lazy',
}: PerfumeImageWithFallbackProps) {
  const sources = candidates
    .map(normalizePerfumeImagePath)
    .filter((candidate) => candidate.length > 0);
  const sourcesKey = sources.join('|');
  const [errorState, setErrorState] = useState({ key: sourcesKey, failed: 0 });
  const failedCount = errorState.key === sourcesKey ? errorState.failed : 0;
  const src = sources[failedCount] ?? PERFUME_FALLBACK_IMAGE_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setErrorState({ key: sourcesKey, failed: failedCount + 1 })}
    />
  );
}
