import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";
import { readCanonicalFragrance } from "@/lib/database/fragrancePages";
import { readEditorialFragranceDetails } from "@/lib/database/curatedCatalog";
import { toPublicFragrance } from "@/lib/database/publicFragrances";
import { getFragranceHref, getFragranceSearchHref } from "@/lib/fragranceNavigation";
import FragranceProfileClient from "./FragranceProfileClient";
import { topPerfumerProfiles } from "@/lib/data/topPerfumerProfiles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: { recordId: string }; searchParams: { fromPerfumer?: string | string[] } };
const readFragrance = cache((routeId: string) => readCanonicalFragrance(decodeURIComponent(routeId)));

export function generateMetadata({ params }: Props): Metadata {
  const found = readFragrance(params.recordId);
  if (!found) return { title: "Fragrance Library", robots: { index: false } };
  const { record } = found;
  const title = `${record.brand} ${record.perfume ?? record.name}`;
  const url = getFragranceHref(record.id);
  return {
    title,
    description: record.description || `Discover ${title}: accords, notes and perfumer details from the OlfactiveDNA catalog.`,
    alternates: { canonical: url },
    openGraph: { title, url },
  };
}

export default function FragrancePage({ params, searchParams }: Props) {
  const found = readFragrance(params.recordId);
  if (!found) redirect(getFragranceSearchHref("", decodeURIComponent(params.recordId).replace(/::/g, " ")));
  const details = readEditorialFragranceDetails(found.rowId);
  const returnPerfumer = topPerfumerProfiles.find((profile) => profile.slug === searchParams.fromPerfumer);
  return <FragranceProfileClient
    fragrance={toPublicFragrance(found.record)}
    credits={details?.creatorCredits?.map(({ name }) => ({ name })) ?? []}
    returnPerfumer={returnPerfumer ? { slug: returnPerfumer.slug, name: returnPerfumer.name } : undefined}
  />;
}
