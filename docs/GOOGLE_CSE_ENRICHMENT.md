# Google CSE Enrichment Workflow

This workflow enriches existing perfume records with missing fields using Google Custom Search API.

## What It Can Fill

- imageUrl (remote image URL)
- launchYear (best-effort from snippets)
- perfumer (best-effort from snippets)

## Input and Output

- Input: data/generated/merged-fragdb-local-db.json
- Output enriched: data/generated/merged-fragdb-local-db.google-enriched.json
- Output report: data/generated/google-cse-enrichment-report.json
- Image localization report: data/generated/google-cse-image-download-report.json
- Local image directory: public/images/perfumes (google-enriched-- filename prefix)

## Required Environment Variables

- GOOGLE_CSE_API_KEY
- GOOGLE_CSE_CX

If these are missing, enrichment automatically falls back to a free mode using Wikipedia/Wikimedia (`source: wikipedia-free`).
In free mode, delay is automatically raised to at least 1200ms between records to reduce rate limits.

Optional:

- GOOGLE_ENRICH_LIMIT (default 200)
- GOOGLE_ENRICH_DELAY_MS (default 150)
- WIKIPEDIA_RETRIES (default 3, used in free fallback mode)

## Run Command (Windows)

Use Node directly:

cmd /c C:\\Progra~1\\nodejs\\node.exe d:\\-projects\\projects\\_Fragrantiq\\scripts\\enrich-perfumes-from-google-cse.mjs

## Studio Buttons

On the Studio Fragrance Database page:

- Enrich Missing Fields (Google)
- Download Approved Images

These trigger server actions that write the same enriched dataset and reports.

## Notes

- This process is best-effort. It does not overwrite existing non-empty fields.
- For large datasets, run in batches with GOOGLE_ENRICH_LIMIT.
- If you need local image files, add a second pass that downloads only licensed/approved sources.
- Image localization only downloads approved hosts and stores localImagePath in the enriched output.
- Google CSE is optional; the free fallback requires no trial or billing setup.
