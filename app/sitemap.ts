import type { MetadataRoute } from 'next';

const BASE_URL = 'https://olfactivedna.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1 },
    { path: '/grounding', priority: 0.9 },
    { path: '/test', priority: 0.9 },
    { path: '/dna', priority: 0.8 },
    { path: '/fragrances', priority: 0.8 },
    { path: '/collection', priority: 0.7 },
    { path: '/territories', priority: 0.6 },
    { path: '/articles', priority: 0.6 },
    { path: '/articles/perfumers', priority: 0.5 },
    { path: '/faq', priority: 0.5 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority,
  }));
}
