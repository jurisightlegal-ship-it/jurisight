import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase-db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/supreme-court-judgements`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/high-court-judgements`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/know-your-law`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  try {
    // Fetch all published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        slug,
        updated_at,
        published_at,
        created_at
      `)
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles for sitemap:', error)
      return staticPages
    }

    // Generate dynamic article pages
    const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || article.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Combine static and dynamic pages
    return [...staticPages, ...articlePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
