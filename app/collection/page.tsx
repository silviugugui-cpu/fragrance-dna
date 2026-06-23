import type { Metadata } from 'next';
import CollectionManager from '@/components/collection/CollectionManager';

export const metadata: Metadata = {
  title: 'My Collection | FragranceDNA',
  description: 'Manage the fragrances that define your personal olfactory library.',
};

export default function CollectionPage() {
  return (
    <main className="main-container page-background">
      <CollectionManager />
    </main>
  );
}