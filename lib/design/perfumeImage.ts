export const PERFUME_FALLBACK_IMAGE_SRC = "/Background/background carton front page.png";
export const PRODUCT_PHOTOS_ENABLED = false;
export const GENERATED_PERFUME_IMAGE_PREFIX = "/images/ai-generated-perfumes/";

export const getPerfumeImageCandidates = (record: {
  blobImageUrl?: string; localImagePath?: string; imageUrl?: string;
}): Array<string | undefined> => [record.blobImageUrl, record.localImagePath, record.imageUrl]
  .map((candidate) => candidate?.trim())
  .filter((candidate): candidate is string => isGeneratedPerfumeImage(candidate));

export const normalizePerfumeImagePath = (value: string | null | undefined): string =>
  String(value ?? "").trim().replace(
    /^\/images\/(master-db|product-photos|google-enriched)\/([^/]+)$/,
    "/images/perfumes/$1--$2",
  );

export const isGeneratedPerfumeImage = (value: string | null | undefined): boolean => {
  const normalized = String(value ?? "").trim();
  return normalized.startsWith(GENERATED_PERFUME_IMAGE_PREFIX)
    && normalized.length > GENERATED_PERFUME_IMAGE_PREFIX.length
    && !normalized.includes("..");
};

export const resolvePerfumeImageSrc = (
  ...candidates: Array<string | null | undefined>
): { src: string; isFallback: boolean } => {
  for (const candidate of candidates) {
    const normalized = normalizePerfumeImagePath(candidate);
    if (isGeneratedPerfumeImage(normalized)) {
      return { src: normalized, isFallback: false };
    }
  }

  return {
    src: PERFUME_FALLBACK_IMAGE_SRC,
    isFallback: true,
  };
};
