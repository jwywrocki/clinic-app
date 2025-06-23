'use client';

import { Heart, Phone, Mail, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { AnimatedSection } from '@/components/ui/animated-section';
import { FadeIn } from '@/components/ui/animation-helpers';
import { useEffect, useState } from 'react';
import { getFormattedContactInfo, getServices } from '@/lib/database';
import { sanitizePhoneNumberHtml, stripHtmlTags } from '@/lib/html-sanitizer';

interface MenuItem {
    id: string;
    title: string;
    url: string;
    order_position: number;
}

interface ContactInfo {
    phone: string | null;
    phoneLabel: string | null;
    email: string | null;
    address: string | null;
    hours: string | null;
    contactGroups?: Array<{
        id: string;
        label: string;
        in_hero: boolean;
        in_footer: boolean;
        contact_details: Array<{
            id: string;
            type: string;
            value: string;
            order_position: number;
        }>;
    }>;
}

interface ServiceItem {
    id: string;
    title: string;
}

interface FooterProps {
    menuItems?: MenuItem[];
}

export function Footer({ menuItems = [] }: FooterProps) {
    const [contactInfo, setContactInfo] = useState<Awaited<ReturnType<typeof getFormattedContactInfo>> | null>(null);
    const [services, setServices] = useState<ServiceItem[]>([]);

    // Filter main menu items (only top-level items without parent_id)
    const mainMenuItems = menuItems.filter((item: any) => !item.parent_id).slice(0, 6);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use our Next.js API instead of direct Supabase access
                const response = await fetch('/api/contact_groups', {
                    cache: 'no-store',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const allGroups = await response.json();
                    const formattedContactInfo = {
                        phone: null,
                        phoneLabel: null,
                        email: null,
                        address: null,
                        hours: null,
                        contactGroups: allGroups.map((group: any) => ({
                            id: group.id,
                            label: group.label,
                            in_hero: group.in_hero,
                            in_footer: group.in_footer,
                            contact_details: group.contact_details
                                ? group.contact_details
                                      .sort((a: any, b: any) => a.order_position - b.order_position)
                                      .map((detail: any) => ({
                                          id: detail.id,
                                          type: detail.type,
                                          value: detail.value,
                                          order_position: detail.order_position,
                                      }))
                                : [],
                        })),
                    };
                    setContactInfo(formattedContactInfo);
                } else {
                    console.error('Failed to fetch contact groups:', response.status, response.statusText);
                }

                // Fetch services using our API instead of direct Supabase access
                const servicesResponse = await fetch('/api/services', {
                    cache: 'no-store',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (servicesResponse.ok) {
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData.slice(0, 6));
                } else {
                    console.error('Failed to fetch services:', servicesResponse.status, servicesResponse.statusText);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych:', error);
            }
        };

        fetchData();
    }, []); // Empty dependency array - run only once on mount

    return (
        <FadeIn direction="up" threshold={0.1}>
            <footer className="bg-gray-900 text-white py-16 border-t-4 border-gray-700" role="contentinfo">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {/* Logo and Description */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                                    <Heart className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold">SPZOZ GOZ</div>
                                    <div className="text-sm text-gray-300">Łopuszno</div>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed font-medium mb-6">Zapewniamy profesjonalną opiekę zdrowotną mieszkańcom Łopuszna i okolic od 1998 roku.</p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-bold mb-4 text-gray-100 text-lg">Szybkie linki</h3>
                            <ul className="space-y-3">
                                {mainMenuItems.map((item: MenuItem) => (
                                    <li key={item.id}>
                                        <Link href={item.url} className="text-gray-300 hover:text-white transition-colors font-medium focus:ring-4 focus:ring-blue-600 rounded px-1 py-1">
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="font-bold mb-4 text-gray-100 text-lg">Nasze usługi</h3>
                            <div className="space-y-1 text-gray-300 font-medium">{services.length > 0 ? services.map((service) => <p key={service.id}>{service.title}</p>) : ''}</div>
                        </div>

                        {/* Contact Information - Updated */}
                        {contactInfo && (
                            <div>
                                <h3 className="font-bold mb-4 text-gray-100 text-lg">Kontakt</h3>
                                <div className="space-y-3 text-gray-300 font-medium">
                                    {/* Primary Contact Details */}
                                    {contactInfo.contactGroups
                                        ?.filter((group) => group.in_footer)
                                        .map((group) => (
                                            <div key={group.id} className="mb-3">
                                                <span className="font-semibold block mb-1">{group.label}</span> {/* Display group label once */}
                                                {group.contact_details
                                                    .sort((a, b) => a.order_position - b.order_position)
                                                    .map((detail) => (
                                                        <div key={detail.id} className="flex items-start gap-2 mb-1 ml-2">
                                                            {' '}
                                                            {/* Indent details */}
                                                            {detail.type === 'phone' && <Phone className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />}
                                                            {detail.type === 'email' && <Mail className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />}
                                                            {detail.type === 'address' && <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />}
                                                            {detail.type === 'hours' && <Clock className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />}
                                                            <div>
                                                                {detail.type === 'phone' ? (
                                                                    <a href={`tel:${stripHtmlTags(detail.value)}`} className="hover:text-white">
                                                                        <span dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }} />
                                                                    </a>
                                                                ) : detail.type === 'email' ? (
                                                                    <a href={`mailto:${detail.value}`} className="hover:text-white">
                                                                        {detail.value}
                                                                    </a>
                                                                ) : (
                                                                    <div
                                                                        className={detail.type === 'hours' ? 'whitespace-pre-line' : ''}
                                                                        dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ))}
                                    {/* Fallback for top-level phone, email, address, hours if no footer groups provide them */}
                                    {!contactInfo.contactGroups?.some((g) => g.in_footer && g.contact_details?.some((d) => d.type === 'phone')) && contactInfo.phone && (
                                        <div className="flex items-center gap-2 mt-2">
                                            {' '}
                                            {/* Added margin top for separation */}
                                            <Phone className="h-4 w-4 text-blue-400" />
                                            <a href={`tel:${stripHtmlTags(contactInfo.phone)}`} className="hover:text-white">
                                                {contactInfo.phoneLabel && <span className="font-semibold">{contactInfo.phoneLabel}: </span>}
                                                <span dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contactInfo.phone) }} />
                                            </a>
                                        </div>
                                    )}
                                    {!contactInfo.contactGroups?.some((g) => g.in_footer && g.contact_details?.some((d) => d.type === 'email')) && contactInfo.email && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Mail className="h-4 w-4 text-blue-400" />
                                            <a href={`mailto:${contactInfo.email}`} className="hover:text-white">
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    )}
                                    {!contactInfo.contactGroups?.some((g) => g.in_footer && g.contact_details?.some((d) => d.type === 'address')) && contactInfo.address && (
                                        <div className="flex items-start gap-2 mt-2">
                                            <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                                            <div dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contactInfo.address) }} />
                                        </div>
                                    )}
                                    {!contactInfo.contactGroups?.some((g) => g.in_footer && g.contact_details?.some((d) => d.type === 'hours')) && contactInfo.hours && (
                                        <div className="flex items-start gap-2 mt-2">
                                            <Clock className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                                            <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contactInfo.hours) }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t-2 border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-300 mb-4 md:mb-0 font-medium">&copy; 2025 SPZOZ Gminny Ośrodek Zdrowia w Łopusznie. Wszelkie prawa zastrzeżone.</p>
                        <div className="flex flex-col items-center gap-4">
                            <Link href="/polityka-prywatnosci" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                Polityka prywatności
                            </Link>
                            <Link
                                href="/admin"
                                className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-600 rounded px-2 py-1 font-medium border-2 border-transparent hover:border-blue-400"
                            >
                                Panel administracyjny
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </FadeIn>
    );
}
