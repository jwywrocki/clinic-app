import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider } from '@/hooks/use-accessibility';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl" suppressHydrationWarning>
            <head>
                <meta name="color-scheme" content="light" />
                <meta name="theme-color" content="#2563eb" />
                <link rel="icon" href="/favicon.ico" />
                {/* Add WCAG 2.1 compliance meta tags */}
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'MedicalOrganization',
                            name: 'Samodzielny Publiczny Zakład Opieki Zdrowotnej Gminny Ośrodek Zdrowia w Łopusznie',
                            alternateName: 'SPZOZ GOZ Łopuszno',
                            description: 'Profesjonalna opieka zdrowotna w sercu Łopuszna',
                            url: 'http://www.gozlopuszno.pl/',
                            telephone: '+48 41 391 40 27',
                            email: 'rejestracja@gozlopuszno.pl',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: 'ul. Strażacka 10',
                                addressLocality: 'Łopuszno',
                                postalCode: '26-070',
                                addressCountry: 'PL',
                            },
                            openingHours: ['Mo-Fr 07:00-19:00', 'Sa 08:00-14:00'],
                            medicalSpecialty: ['Family Medicine', 'Cardiology', 'Diabetology', 'Pediatrics', 'Emergency Medicine'],
                            hasOfferCatalog: {
                                '@type': 'OfferCatalog',
                                name: 'Usługi medyczne',
                                itemListElement: [
                                    {
                                        '@type': 'Offer',
                                        itemOffered: {
                                            '@type': 'MedicalProcedure',
                                            name: 'Medycyna rodzinna',
                                        },
                                    },
                                    {
                                        '@type': 'Offer',
                                        itemOffered: {
                                            '@type': 'MedicalProcedure',
                                            name: 'Konsultacje specjalistyczne',
                                        },
                                    },
                                ],
                            },
                        }),
                    }}
                />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <AccessibilityProvider>{children}</AccessibilityProvider>
            </body>
        </html>
    );
}
