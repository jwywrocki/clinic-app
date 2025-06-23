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

        let robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific paths
Allow: /api/public/`;

        if (supabase) {
            try {
                const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'robots_txt').single();

                if (setting && setting.value) {
                    robotsContent = setting.value;
                }
            } catch (error) {
                console.error('Error fetching robots.txt from settings:', error);
                // Fall back to default content
            }
        }

        return new NextResponse(robotsContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Error generating robots.txt:', error);

        // Return default robots.txt on error
        const defaultRobots = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/`;

        return new NextResponse(defaultRobots, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
}
