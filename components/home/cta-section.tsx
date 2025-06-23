'use client';

import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Phone, MapPin, ArrowRight, Clock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFormattedContactInfo } from '@/lib/database';
import { stripHtmlTags, sanitizePhoneNumberHtml } from '@/lib/html-sanitizer';

type ContactInfoType = Awaited<ReturnType<typeof getFormattedContactInfo>>;

export function CtaSection() {
    const [contactInfo, setContactInfo] = useState<ContactInfoType | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getFormattedContactInfo();
                setContactInfo(data);
            } catch (error) {
                console.error('Error fetching contact info for CTA section:', error);
            }
        };
        fetchData();
    }, []);

    const displayContacts = contactInfo?.contactGroups?.filter((g) => g.in_hero).flatMap((g) => g.contact_details.map((d) => ({ ...d, groupLabel: g.label }))) || [];

    const primaryPhone = displayContacts.find((c) => c.type === 'phone');
    const primaryAddress = displayContacts.find((c) => c.type === 'address');
    const primaryHours = displayContacts.find((c) => c.type === 'hours');

    const phoneValue = primaryPhone?.value || contactInfo?.phone;
    const phoneLabel = primaryPhone?.groupLabel || contactInfo?.phoneLabel || 'Kontakt';
    const addressValue = primaryAddress?.value || contactInfo?.address;
    const hoursValue = primaryHours?.value || contactInfo?.hours;

    return (
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column */}
                    <AnimatedSection animation="fadeInLeft">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
                                    <span className="text-blue-200 text-sm font-medium">UMÓW SIĘ JUŻ DZIŚ</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                    Zadbaj o swoje{' '}
                                    <span className="text-blue-200 relative">
                                        zdrowie
                                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-300 to-blue-100 rounded-full"></div>
                                    </span>{' '}
                                    już dziś
                                </h2>
                                <p className="text-xl text-blue-100 leading-relaxed">
                                    Nie czekaj z wizytą u lekarza. Umów się na konsultację i zadbaj o swoje zdrowie oraz zdrowie swoich bliskich. Nasz zespół specjalistów jest gotowy Ci pomóc.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <Link href="/kontakt">
                                        <Phone className="mr-2 h-5 w-5" />
                                        Umów wizytę
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <Link href="/kontakt">
                                        <MapPin className="mr-2 h-5 w-5" />
                                        Jak dojechać
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Right Column */}
                    <AnimatedSection animation="fadeInRight" delay={200}>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                            <h3 className="text-2xl font-bold text-white mb-6">Informacje kontaktowe</h3>
                            {contactInfo ? (
                                <div className="space-y-6">
                                    {displayContacts.length > 0 ? (
                                        contactInfo?.contactGroups
                                            ?.filter((g) => g.in_hero)
                                            .map((group) => (
                                                <div key={group.id} className="mb-4">
                                                    {' '}
                                                    <p className="text-blue-200 text-sm font-semibold mb-1">{group.label}</p>
                                                    {group.contact_details
                                                        .filter((contact) => ['phone', 'address', 'hours'].includes(contact.type))
                                                        .map((contact) => {
                                                            let IconComponent = Phone;
                                                            if (contact.type === 'email') IconComponent = Mail;
                                                            else if (contact.type === 'address') IconComponent = MapPin;
                                                            else if (contact.type === 'hours') IconComponent = Clock;

                                                            return (
                                                                <div key={contact.id} className="flex items-center space-x-4 mb-2 ml-2">
                                                                    {' '}
                                                                    <div className="bg-blue-500 p-3 rounded-xl flex-shrink-0">
                                                                        <IconComponent className="h-6 w-6 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        {contact.type === 'phone' ? (
                                                                            <a
                                                                                href={`tel:${stripHtmlTags(contact.value)}`}
                                                                                className="text-lg font-semibold text-white hover:text-blue-100 transition-colors"
                                                                            >
                                                                                <span dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contact.value) }} />
                                                                            </a>
                                                                        ) : contact.type === 'address' ? (
                                                                            <address
                                                                                className="not-italic text-lg font-semibold text-white"
                                                                                dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contact.value) }}
                                                                            />
                                                                        ) : contact.type === 'hours' ? (
                                                                            <div
                                                                                className="text-lg font-semibold text-white whitespace-pre-line"
                                                                                dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(contact.value) }}
                                                                            />
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            ))
                                    ) : (
                                        <>
                                            {phoneValue && (
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-blue-500 p-3 rounded-xl flex-shrink-0">
                                                        <Phone className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-blue-200 text-sm">{phoneLabel}</p>
                                                        <a href={`tel:${stripHtmlTags(phoneValue)}`} className="text-lg font-semibold text-white hover:text-blue-100 transition-colors">
                                                            <span dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(phoneValue) }} />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            {addressValue && (
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-blue-500 p-3 rounded-xl flex-shrink-0">
                                                        <MapPin className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-blue-200 text-sm">Adres</p>
                                                        <address className="not-italic text-lg font-semibold text-white" dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(addressValue) }} />
                                                    </div>
                                                </div>
                                            )}
                                            {hoursValue && (
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-blue-500 p-3 rounded-xl flex-shrink-0">
                                                        <Clock className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-blue-200 text-sm">Godziny otwarcia</p>
                                                        <div
                                                            className="text-lg font-semibold text-white whitespace-pre-line"
                                                            dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(hoursValue) }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="pt-4 border-t border-white/20">
                                        <Button asChild variant="ghost" className="text-white hover:text-blue-200 hover:bg-white/10 p-0 h-auto font-semibold">
                                            <Link href="/kontakt">
                                                Zobacz pełne informacje kontaktowe
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-400 p-3 rounded-xl flex-shrink-0 animate-pulse h-12 w-12"></div>
                                        <div className="w-full space-y-2">
                                            <div className="h-4 bg-blue-300 rounded w-1/4 animate-pulse"></div>
                                            <div className="h-5 bg-blue-200 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-5 bg-blue-200 rounded w-1/2 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-400 p-3 rounded-xl flex-shrink-0 animate-pulse h-12 w-12"></div>
                                        <div className="w-full space-y-2">
                                            <div className="h-4 bg-blue-300 rounded w-1/4 animate-pulse"></div>
                                            <div className="h-5 bg-blue-200 rounded w-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-400 p-3 rounded-xl flex-shrink-0 animate-pulse h-12 w-12"></div>
                                        <div className="w-full space-y-2">
                                            <div className="h-4 bg-blue-300 rounded w-1/4 animate-pulse"></div>
                                            <div className="h-5 bg-blue-200 rounded w-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
}
