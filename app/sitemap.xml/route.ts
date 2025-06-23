import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
    try {
        const supabase = createSupabaseClient();
        // Use NEXT_PUBLIC_SITE_URL or fallback to localhost for development
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';

        let urls: Array<{ url: string; lastmod: string; changefreq: string; priority: string }> = [
            {
                url: baseUrl,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'daily',
                priority: '1.0',
            },
            {
                url: `${baseUrl}/o-nas`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.8',
            },
            {
                url: `${baseUrl}/uslugi`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.9',
            },
            {
                url: `${baseUrl}/lekarze`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.8',
            },
            {
                url: `${baseUrl}/aktualnosci`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'daily',
                priority: '0.7',
            },
            {
                url: `${baseUrl}/kontakt`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.6',
            },
        ];

        if (supabase) {
            try {
                // Add dynamic pages
                const { data: pages } = await supabase.from('pages').select('slug, updated_at').eq('is_published', true);

                if (pages) {
                    pages.forEach((page) => {
                        urls.push({
                            url: `${baseUrl}/${page.slug}`,
                            lastmod: new Date(page.updated_at).toISOString().split('T')[0],
                            changefreq: 'monthly',
                            priority: '0.5',
                        });
                    });
                }

                // Add news pages
                const { data: news } = await supabase.from('news').select('id, updated_at').eq('is_published', true);

                if (news) {
                    news.forEach((article) => {
                        urls.push({
                            url: `${baseUrl}/aktualnosci/${article.id}`,
                            lastmod: new Date(article.updated_at).toISOString().split('T')[0],
                            changefreq: 'monthly',
                            priority: '0.4',
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching dynamic pages for sitemap:', error);
            }
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        ({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

        return new NextResponse(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);

        // Use NEXT_PUBLIC_SITE_URL or fallback to localhost for development
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';
        const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

        return new NextResponse(minimalSitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    }
}
