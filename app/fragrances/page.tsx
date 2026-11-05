import FragranceLibraryClient from "./FragranceLibraryClient";

export default function FragranceLibraryPage({ searchParams }: {
  searchParams: { q?: string | string[] };
}) {
  return <FragranceLibraryClient initialQuery={typeof searchParams.q === "string" ? searchParams.q : ""} />;
}
