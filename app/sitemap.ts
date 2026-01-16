import { MetadataRoute } from 'next'
import { cities } from '@/lib/cities'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://divyanshubca.vercel.app'

  const cityRoutes = cities.map((city) => ({
    url: `${baseUrl}/hire-web-developer-in-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/web-development-seo-audit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...cityRoutes,
  ]
}