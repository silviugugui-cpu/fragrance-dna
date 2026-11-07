export const PERFUME_FALLBACK_IMAGE_SRC = "/Background/background carton front page.png";

export const getPerfumeImageCandidates = (record: {
  blobImageUrl?: string; localImagePath?: string; imageUrl?: string;
}): Array<string | undefined> => [record.blobImageUrl, record.localImagePath, record.imageUrl];

export const normalizePerfumeImagePath = (value: string | null | undefined): string =>
  String(value ?? "").trim().replace(
    /^\/images\/(master-db|product-photos|google-enriched|ai-generated-perfumes)\/([^/]+)$/,
    "/images/perfumes/$1--$2",
  );

export const resolvePerfumeImageSrc = (
  ...candidates: Array<string | null | undefined>
): { src: string; isFallback: boolean } => {
  for (const candidate of candidates) {
    const normalized = normalizePerfumeImagePath(candidate);
    if (normalized.length > 0) {
      return { src: normalized, isFallback: false };
    }
  }

  return {
    src: PERFUME_FALLBACK_IMAGE_SRC,
    isFallback: true,
  };
};
