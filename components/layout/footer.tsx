'use client';

import { Heart, Phone, Mail, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { AnimatedSection } from '@/components/ui/animated-section';
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
    featuredContacts?: Array<{
        label: string;
        type: string;
        value: string;
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
    const [items, setItems] = useState<MenuItem[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contactData = await getFormattedContactInfo();
                setContactInfo(contactData);

                const servicesData = await getServices();
                if (servicesData) {
                    setServices(servicesData.map((service) => ({ id: service.id, title: service.title })).slice(0, 6));
                }

                if (contactData) {
                    console.log('Contact Info fetched:', contactData);
                }

                if (menuItems.length > 0) {
                    setItems(menuItems);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych:', error);
            }
        };

        fetchData();
    }, [menuItems]);

    return (
        <AnimatedSection animation="fadeInUp">
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
                            <p className="text-gray-300 leading-relaxed font-medium mb-6">Zapewniamy profesjonalną opiekę zdrowotną mieszkańcom Łopuszna i okolic od 1995 roku.</p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-bold mb-4 text-gray-100 text-lg">Szybkie linki</h3>
                            <ul className="space-y-3">
                                {items.map((item) => (
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
                                        ?.filter((group) => group.featured)
                                        .map((group) => (
                                            <div key={group.id} className="mb-3">
                                                <span className="font-semibold block mb-1">{group.label}</span> {/* Display group label once */}
                                                {group.contact_details.map((detail) => (
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
                                    {/* Fallback for top-level phone, email, address, hours if no featured groups provide them */}
                                    {!contactInfo.contactGroups?.some((g) => g.featured && g.contact_details?.some((d) => d.type === 'phone')) && contactInfo.phone && (
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
                                    {!contactInfo.contactGroups?.some((g) => g.featured && g.contact_details?.some((d) => d.type === 'email')) && contactInfo.email && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Mail className="h-4 w-4 text-blue-400" />
                                            <a href={`mailto:${contactInfo.email}`} className="hover:text-white">
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    )}
                                    {!contactInfo.contactGroups?.some((g) => g.featured && g.contact_details?.some((d) => d.type === 'address')) && contactInfo.address && (
                                        <div className="flex items-start gap-2 mt-2">
                                            <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                                            <div dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contactInfo.address) }} />
                                        </div>
                                    )}
                                    {!contactInfo.contactGroups?.some((g) => g.featured && g.contact_details?.some((d) => d.type === 'hours')) && contactInfo.hours && (
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
                        <p className="text-gray-300 mb-4 md:mb-0 font-medium">&copy; 2024 SPZOZ Gminny Ośrodek Zdrowia w Łopusznie. Wszelkie prawa zastrzeżone.</p>
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
        </AnimatedSection>
    );
}
