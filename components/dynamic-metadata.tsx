'use client';

import { useEffect } from 'react';

interface DynamicMetadataProps {
    settings?: Record<string, string>;
}

export function DynamicMetadata({ settings = {} }: DynamicMetadataProps) {
    useEffect(() => {
        if (!settings || Object.keys(settings).length === 0) return;

        // Update document title
        if (settings.site_title) {
            document.title = settings.site_title;
        }

        // Update meta description
        if (settings.site_description) {
            updateMetaTag('description', settings.site_description);
        }

        // Update meta keywords
        if (settings.site_keywords) {
            updateMetaTag('keywords', settings.site_keywords);
        }

        // Update author
        if (settings.site_author) {
            updateMetaTag('author', `Jakub Wywrocki, <${settings.site_author}>`);
        }

        // Update meta viewport
        if (settings.meta_viewport) {
            updateMetaName('viewport', settings.meta_viewport);
        }

        // Update language
        if (settings.meta_language) {
            document.documentElement.lang = settings.meta_language;
        }

        // Update charset
        if (settings.meta_charset) {
            updateCharset(settings.meta_charset);
        }

        // Update canonical URL
        if (settings.canonical_url) {
            updateCanonicalLink(settings.canonical_url);
        }

        // Update favicon
        if (settings.favicon_url) {
            updateFavicon(settings.favicon_url);
        }

        // Add Schema.org structured data (only if not already present server-side)
        const existingServerSideSchema = document.querySelector('script[type="application/ld+json"]');

        if (settings.structured_data_enabled === 'true' && !existingServerSideSchema) {
            console.log('No server-side Schema.org detected, adding client-side Schema.org...');
            addStructuredData(settings);
        }

        // Update basic Open Graph tags from existing settings
        if (settings.site_title || settings.site_description) {
            updateOpenGraphTags(settings);
        }
    }, [settings]);

    return null; // This component doesn't render anything
}

function updateMetaTag(name: string, content: string) {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
    }
    meta.content = content;
}

function updateMetaName(name: string, content: string) {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
    }
    meta.content = content;
}

function updateCanonicalLink(href: string) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
    }
    link.href = href;
}

function updateFavicon(href: string) {
    // Remove all existing favicon links
    const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingLinks.forEach((link) => link.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = href;

    document.head.appendChild(link);

    // Force browser to reload favicon by creating temporary link
    const tempLink = document.createElement('link');
    tempLink.rel = 'icon';
    tempLink.href = href + (href.includes('?') ? '&' : '?') + 't=' + Date.now();
    document.head.appendChild(tempLink);

    // Remove temp link after short delay
    setTimeout(() => {
        tempLink.remove();
    }, 100);
}

function updateCharset(charset: string) {
    let meta = document.querySelector('meta[charset]') as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('charset', charset);
        document.head.insertBefore(meta, document.head.firstChild);
    } else {
        meta.setAttribute('charset', charset);
    }
}

function addStructuredData(settings: Record<string, string>) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]#organization-schema');
    if (existingScript) {
        existingScript.remove();
    }

    // Only add if we have required data
    if (!settings.schema_name || !settings.schema_type) {
        console.log('Missing required schema data for client-side generation');
        return;
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
        ...(settings.schema_opening_hours && { openingHours: settings.schema_opening_hours.split(',').map((h) => h.trim()) }),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'organization-schema';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    console.log('Client-side Schema.org script added to head');
}

function updateOpenGraphTags(settings: Record<string, string>) {
    // Update Open Graph title
    if (settings.site_title) {
        updateMetaProperty('og:title', settings.site_title);
    }

    // Update Open Graph description
    if (settings.site_description) {
        updateMetaProperty('og:description', settings.site_description);
    }

    // Update Open Graph URL
    if (settings.canonical_url) {
        updateMetaProperty('og:url', settings.canonical_url);
    }

    // Set basic Open Graph type
    updateMetaProperty('og:type', 'website');

    // Update Open Graph site name from schema_name if available
    if (settings.schema_name) {
        updateMetaProperty('og:site_name', settings.schema_name);
    }

    // Set locale
    if (settings.meta_language) {
        const locale = settings.meta_language === 'pl' ? 'pl_PL' : 'en_US';
        updateMetaProperty('og:locale', locale);
    }
}

function updateMetaProperty(property: string, content: string) {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
    }
    meta.content = content;
}
