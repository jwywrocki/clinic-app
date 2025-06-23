'use client';

import type React from 'react';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SkipLink } from '@/components/ui/skip-link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Clock, Send, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { sanitizePhoneNumberHtml, stripHtmlTags } from '@/lib/html-sanitizer';

interface DisplayableContactGroup {
    id: string;
    label: string;
    featured: boolean;
    contact_details: Array<{
        id: string;
        type: 'phone' | 'email' | 'address' | 'hours' | 'emergency_contact';
        value: string;
        icon: React.ElementType;
    }>;
}

interface PageContent {
    id: string;
    title: string;
    content: string;
    slug: string;
}

export default function ContactPage() {
    const [allContactGroups, setAllContactGroups] = useState<DisplayableContactGroup[]>([]);
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const supabase = createSupabaseClient();
                if (!supabase) {
                    console.warn('Supabase client not initialized for Contact page.');
                    setLoading(false);
                    return;
                }

                const { data: pageData, error: pageError } = await supabase.from('pages').select('*').eq('slug', 'kontakt').single();
                if (pageError) console.error('Error fetching contact page content:', pageError);
                else setPageContent(pageData);

                const response = await fetch('/api/contact_groups', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch contact groups: ${response.statusText}`);
                }
                const groupsData = await response.json();

                if (Array.isArray(groupsData)) {
                    const displayGroups: DisplayableContactGroup[] = groupsData.map((group: any) => ({
                        ...group,
                        contact_details: (group.contact_details || []).map((detail: any) => {
                            let icon = Mail;
                            if (detail.type === 'phone') icon = Phone;
                            if (detail.type === 'address') icon = MapPin;
                            if (detail.type === 'hours') icon = Clock;
                            if (detail.type === 'emergency_contact') icon = AlertTriangle;
                            return { ...detail, icon };
                        }),
                    }));
                    setAllContactGroups(displayGroups);
                } else {
                    console.error('Fetched contact groups data is not an array:', groupsData);
                    setAllContactGroups([]);
                }

                // Fetch Google Maps URL from settings
                try {
                    const mapsResponse = await fetch('/api/admin/settings?key=google_maps_embed_url', { cache: 'no-store' });
                    if (mapsResponse.ok) {
                        const mapsData = await mapsResponse.json();
                        if (mapsData && mapsData.value) {
                            setGoogleMapsUrl(mapsData.value);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching Google Maps URL:', error);
                }
            } catch (error) {
                console.error('Error in fetchData (Contact Page):', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus(null);

        // Client-side validation
        if (!formState.name || !formState.email || !formState.subject || !formState.message) {
            setFormStatus({ type: 'error', message: 'Wszystkie pola są wymagane.' });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formState.email)) {
            setFormStatus({ type: 'error', message: 'Proszę podać prawidłowy adres email.' });
            return;
        }

        try {
            setFormStatus({ type: 'success', message: 'Wysyłanie wiadomości...' });

            const response = await fetch('/api/contact/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            const data = await response.json();

            if (response.ok) {
                setFormStatus({
                    type: 'success',
                    message: data.message || 'Wiadomość wysłana pomyślnie! Skontaktujemy się wkrótce.',
                });
                setFormState({ name: '', email: '', subject: '', message: '' });
            } else {
                setFormStatus({
                    type: 'error',
                    message: data.error || 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.',
                });
            }
        } catch (error) {
            console.error('Error sending contact form:', error);
            setFormStatus({
                type: 'error',
                message: 'Wystąpił błąd podczas wysyłania wiadomości. Sprawdź połączenie internetowe i spróbuj ponownie.',
            });
        }
    };

    if (loading) {
        return (
            <LayoutWrapper>
                <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Ładowanie strony kontaktowej...</p>
                    </div>
                </div>
            </LayoutWrapper>
        );
    }

    return (
        <LayoutWrapper>
            <SkipLink href="#main-content">Przejdź do głównej treści</SkipLink>
            <div id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
                <AnimatedSection animation="fadeInUp">
                    <section className="py-20">
                        <div className="container mx-auto px-4 text-center">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">Kontakt</Badge>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{pageContent?.title || 'Skontaktuj się z Nami'}</h1>
                            <div
                                className="text-xl text-gray-600 max-w-3xl mx-auto prose prose-xl max-w-none text-center"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        pageContent?.content ||
                                        'Jesteśmy do Twojej dyspozycji. Poniżej znajdziesz nasze dane kontaktowe oraz formularz, za pomocą którego możesz wysłać do nas wiadomość.',
                                }}
                            />
                        </div>
                    </section>
                </AnimatedSection>

                <AnimatedSection animation="fadeInUp" delay={200}>
                    {/* Contact Info Section */}
                    <section className="py-10 bg-white">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dane Kontaktowe</h2>
                            {allContactGroups.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allContactGroups.map((group) => (
                                        <Card key={group.id} className="border border-gray-200 shadow-sm bg-white">
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 capitalize mb-4">{group.label}</h3>
                                                <div className="space-y-4">
                                                    {group.contact_details.map((detail) => (
                                                        <div key={detail.id} className="flex items-start space-x-3">
                                                            <div
                                                                className={`${
                                                                    detail.type === 'emergency_contact'
                                                                        ? 'bg-red-500'
                                                                        : detail.type === 'email'
                                                                        ? 'bg-green-500'
                                                                        : detail.type === 'phone'
                                                                        ? 'bg-blue-500'
                                                                        : detail.type === 'address'
                                                                        ? 'bg-purple-500'
                                                                        : 'bg-orange-500'
                                                                } p-2 rounded-lg flex-shrink-0`}
                                                            >
                                                                <detail.icon className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm text-gray-500 mb-1">
                                                                    {detail.type === 'phone'
                                                                        ? 'Telefon'
                                                                        : detail.type === 'email'
                                                                        ? 'Email'
                                                                        : detail.type === 'address'
                                                                        ? 'Adres'
                                                                        : detail.type === 'hours'
                                                                        ? 'Godziny otwarcia'
                                                                        : detail.type === 'emergency_contact'
                                                                        ? 'Kontakt awaryjny'
                                                                        : detail.type}
                                                                </div>
                                                                {detail.type === 'email' ? (
                                                                    <a
                                                                        href={`mailto:${stripHtmlTags(detail.value)}`}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                                        dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }}
                                                                    />
                                                                ) : detail.type === 'phone' || detail.type === 'emergency_contact' ? (
                                                                    <a
                                                                        href={`tel:${stripHtmlTags(detail.value).replace(/\s/g, '')}`}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                                        dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }}
                                                                    />
                                                                ) : (
                                                                    <div className="text-gray-900 font-medium" dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border border-gray-200 shadow-sm bg-white p-8 max-w-md mx-auto">
                                    <div className="text-center text-gray-600">
                                        <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p>Brak dostępnych informacji kontaktowych.</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </section>
                </AnimatedSection>

                <AnimatedSection animation="fadeInUp" delay={300}>
                    {/* Contact Form Section */}
                    <section className="py-10 bg-gray-50">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Napisz do Nas</h2>
                            <div className="max-w-4xl mx-auto">
                                <Card className="border border-gray-200 shadow-sm bg-white">
                                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
                                                    Imię i Nazwisko
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formState.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="Wprowadź swoje imię i nazwisko"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                                                    Adres Email
                                                </Label>
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={formState.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="twoj@email.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="subject" className="text-gray-700 font-medium mb-2 block">
                                                Temat
                                            </Label>
                                            <Input
                                                type="text"
                                                name="subject"
                                                id="subject"
                                                value={formState.subject}
                                                onChange={handleInputChange}
                                                required
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Krótko opisz temat wiadomości"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="message" className="text-gray-700 font-medium mb-2 block">
                                                Wiadomość
                                            </Label>
                                            <Textarea
                                                name="message"
                                                id="message"
                                                rows={5}
                                                value={formState.message}
                                                onChange={handleInputChange}
                                                required
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                                placeholder="Opisz szczegółowo swoją sprawę..."
                                            />
                                        </div>
                                        {formStatus && (
                                            <div
                                                className={`p-4 rounded-lg border text-sm font-medium ${
                                                    formStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    {formStatus.type === 'success' ? <Send className="h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                                                    {formStatus.message}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center">
                                                <Send className="mr-2 h-4 w-4" />
                                                Wyślij Wiadomość
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Google Maps Section */}
                {googleMapsUrl && (
                    <AnimatedSection animation="fadeInUp" className="bg-gray-50">
                        <section className="pt-16 pb-8">
                            <div className="container mx-auto px-4 mb-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Znajdź nas</h2>
                                    <p className="text-gray-600">Nasza lokalizacja na mapie</p>
                                </div>
                            </div>
                            <div className="w-screen h-96 md:h-[500px] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                                <iframe
                                    src={googleMapsUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Lokalizacja kliniki"
                                />
                            </div>
                        </section>
                    </AnimatedSection>
                )}
            </div>
        </LayoutWrapper>
    );
}
