import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readEditorialHouseCatalog } from "@/lib/database/curatedCatalog";
import HousesClient from "../HousesClient";
import { BadgeFilterError, parseBadgeFilters, type BadgeFilters } from "@/lib/fragranceBadges";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { houseId: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export function generateMetadata({ params }: PageProps): Metadata {
  const catalog = readEditorialHouseCatalog(params.houseId, "", 1);
  return { title: catalog ? catalog.house.name : "OlfactiveDNA" };
}

export default function HousePage({ params, searchParams }: PageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q.slice(0, 200) : "";
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  let filters: BadgeFilters;
  try {
    filters = parseBadgeFilters({ get: (name) => typeof searchParams[name] === "string" ? searchParams[name] : null });
  } catch (error: unknown) {
    if (error instanceof BadgeFilterError) notFound();
    throw error;
  }
  const catalog = readEditorialHouseCatalog(params.houseId, query, page, filters);
  if (!catalog) notFound();
  return <HousesClient catalog={catalog} query={query} filters={filters} />;
}
