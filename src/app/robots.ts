import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Evita que Google indexe el panel de administración
    },
    sitemap: 'https://inv-elrey2020.vercel.app/sitemap.xml',
  };
}