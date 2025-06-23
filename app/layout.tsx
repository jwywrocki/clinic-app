import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider } from '@/hooks/use-accessibility';
import { getSiteSettings, generateSchemaOrgStructuredData } from '@/lib/metadata';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SPZOZ Gminny Ośrodek Zdrowia w Łopusznie - Profesjonalna opieka zdrowotna',
    description:
        'Samodzielny Publiczny Zakład Opieki Zdrowotnej Gminny Ośrodek Zdrowia w Łopusznie oferuje kompleksową opiekę medyczną dla całej rodziny. Medycyna rodzinna, specjaliści, pogotowie ratunkowe 24/7.',
    keywords: 'ośrodek zdrowia Łopuszno, lekarz rodzinny, pogotowie ratunkowe, SPZOZ, opieka medyczna, kardiolog, diabetolog, pediatra, Łopuszno zdrowie',
    authors: [{ name: 'SPZOZ Gminny Ośrodek Zdrowia w Łopusznie' }],
    robots: 'index, follow',
    openGraph: {
        title: 'SPZOZ Gminny Ośrodek Zdrowia w Łopusznie',
        description: 'Profesjonalna opieka zdrowotna w sercu Łopuszna. Medycyna rodzinna, specjaliści, pogotowie 24/7.',
        type: 'website',
        locale: 'pl_PL',
        siteName: 'SPZOZ GOZ Łopuszno',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SPZOZ Gminny Ośrodek Zdrowia w Łopusznie',
        description: 'Profesjonalna opieka zdrowotna w sercu Łopuszna',
    },
    alternates: {
        canonical: 'http://www.gozlopuszno.pl/',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // Get site settings for Schema.org
    const settings = await getSiteSettings();
    const schemaData = generateSchemaOrgStructuredData(settings);

    return (
        <html lang={settings.meta_language || 'pl'} suppressHydrationWarning>
            <head>
                <meta name="color-scheme" content="light" />
                <meta name="theme-color" content="#2563eb" />
                {/* Add WCAG 2.1 compliance meta tags */}
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                {/* Schema.org structured data */}
                {schemaData && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(schemaData, null, 2),
                        }}
                    />
                )}
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <AccessibilityProvider>{children}</AccessibilityProvider>
            </body>
        </html>
    );
}
