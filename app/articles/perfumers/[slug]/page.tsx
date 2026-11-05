import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { topPerfumerProfiles } from '@/lib/data/topPerfumerProfiles';
import { readEvidencedPerfumerProfiles } from '@/lib/database/perfumerProfiles';
import PerfumerProfileClient from './PerfumerProfileClient';

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return topPerfumerProfiles.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const profile = topPerfumerProfiles.find((item) => item.slug === params.slug);
  if (!profile) return { title: 'Perfumer profile' };
  return {
    title: `${profile.name} · Perfumer Profile`,
    description: `Biography, attributed creations and catalog-based statistics for ${profile.name}.`,
    alternates: { canonical: `https://olfactivedna.com/articles/perfumers/${profile.slug}` },
  };
}

export default function PerfumerProfilePage({ params }: PageProps) {
  const profile = readEvidencedPerfumerProfiles().find((item) => item.slug === params.slug);
  if (!profile) notFound();

  return <PerfumerProfileClient profile={profile} />;
}
