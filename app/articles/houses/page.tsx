import type { Metadata } from "next";
import { readEditorialHouses } from "@/lib/database/curatedCatalog";
import HousesClient from "./HousesClient";
import { BadgeFilterError, parseBadgeFilters, type BadgeFilters } from "@/lib/fragranceBadges";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "TOP Olfactive Houses" };

export default function HousesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  let filters: BadgeFilters;
  try {
    filters = parseBadgeFilters({ get: (name) => typeof searchParams[name] === "string" ? searchParams[name] : null });
  } catch (error: unknown) {
    if (error instanceof BadgeFilterError) notFound();
    throw error;
  }
  const query = typeof searchParams.q === "string" ? searchParams.q.slice(0, 200) : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";
  return <HousesClient houses={readEditorialHouses(filters)} filters={filters} query={query} initialCategory={category} />;
}
