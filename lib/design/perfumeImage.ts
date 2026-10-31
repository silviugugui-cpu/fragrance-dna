export const PERFUME_FALLBACK_IMAGE_SRC = "/Background/background carton front page.png";

const clean = (value: string | null | undefined): string => String(value ?? "").trim();

export const resolvePerfumeImageSrc = (
  ...candidates: Array<string | null | undefined>
): { src: string; isFallback: boolean } => {
  for (const candidate of candidates) {
    const normalized = clean(candidate);
    if (normalized.length > 0) {
      return { src: normalized, isFallback: false };
    }
  }

  return {
    src: PERFUME_FALLBACK_IMAGE_SRC,
    isFallback: true,
  };
};
