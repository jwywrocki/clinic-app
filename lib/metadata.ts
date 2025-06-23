import { createSupabaseClient } from '@/lib/supabase';

interface SiteSettings {
    [key: string]: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const supabase = createSupabaseClient();

        if (!supabase) {
            console.warn('Supabase client not available, returning empty settings');
            return {};
        }

        const { data: settings, error } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', [
                'site_title',
                'site_description',
                'site_keywords',
                'site_author',
                'meta_viewport',
                'meta_language',
                'meta_charset',
                'canonical_url',
                'favicon_url',
                'robots_txt',
                'sitemap_url',
                'schema_type',
                'schema_name',
                'schema_description',
                'schema_address',
                'schema_phone',
                'schema_email',
                'schema_opening_hours',
                'structured_data_enabled',
                'h1_title',
                'meta_title_template',
                'breadcrumb_enabled',
            ]);

        if (error) {
            console.error('Error fetching site settings:', error);
            return {};
        }

        const settingsObj: SiteSettings = {};
        settings?.forEach((setting) => {
            settingsObj[setting.key] = setting.value || '';
        });

        return settingsObj;
    } catch (error) {
        console.error('Error in getSiteSettings:', error);
        return {};
    }
}

export function generateSchemaOrgStructuredData(settings: SiteSettings): object | null {
    if (settings.structured_data_enabled !== 'true' || !settings.schema_name || !settings.schema_type) {
        return null;
    }

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': settings.schema_type,
        name: settings.schema_name,
        description: settings.schema_description || settings.site_description,
        url: settings.canonical_url,
        ...(settings.schema_address && { address: settings.schema_address }),
        ...(settings.schema_phone && { telephone: settings.schema_phone }),
        ...(settings.schema_email && { email: settings.schema_email }),
        ...(settings.schema_opening_hours && {
            openingHours: settings.schema_opening_hours.split(',').map((h: string) => h.trim()),
        }),
    };

    return structuredData;
}
