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
import { createClient } from '@supabase/supabase-js';
import { sanitizePhoneNumberHtml, stripHtmlTags } from '@/lib/html-sanitizer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client for Contact page:', error);
    }
}

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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
        if (!formState.name || !formState.email || !formState.subject || !formState.message) {
            setFormStatus({ type: 'error', message: 'Wszystkie pola są wymagane.' });
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formState.email)) {
            setFormStatus({ type: 'error', message: 'Proszę podać prawidłowy adres email.' });
            return;
        }
        console.log('Form data:', formState);
        setFormStatus({ type: 'success', message: 'Wiadomość wysłana pomyślnie! Skontaktujemy się wkrótce.' });
        setFormState({ name: '', email: '', subject: '', message: '' });
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
            <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
                    <section className="py-10 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="grid lg:grid-cols-2 gap-12">
                                {/* Contact Info Section */}
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Dane Kontaktowe</h2>
                                    {allContactGroups.length > 0 ? (
                                        <div className="space-y-8">
                                            {allContactGroups.map((group) => (
                                                <Card key={group.id} className="border-0 shadow-lg bg-gray-50 p-6">
                                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                                        {group.label}
                                                        {group.featured && (
                                                            <Badge variant="secondary" className="ml-2">
                                                                Wyróżniony
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {group.contact_details.map((detail) => (
                                                            <div key={detail.id} className="flex items-start space-x-3">
                                                                <div className={`${detail.type === 'emergency_contact' ? 'bg-red-600' : 'bg-blue-600'} p-3 rounded-lg flex-shrink-0`}>
                                                                    <detail.icon className="h-5 w-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-500 capitalize">
                                                                        {detail.type === 'emergency_contact' ? 'Kontakt Alarmowy' : detail.type.replace('_', ' ')}
                                                                    </p>
                                                                    {detail.type === 'email' ? (
                                                                        <a
                                                                            href={`mailto:${stripHtmlTags(detail.value)}`}
                                                                            className="text-blue-600 hover:underline"
                                                                            dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }}
                                                                        />
                                                                    ) : detail.type === 'phone' || detail.type === 'emergency_contact' ? (
                                                                        <a
                                                                            href={`tel:${stripHtmlTags(detail.value).replace(/\s/g, '')}`}
                                                                            className="text-blue-600 hover:underline"
                                                                            dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }}
                                                                        />
                                                                    ) : (
                                                                        <div dangerouslySetInnerHTML={{ __html: sanitizePhoneNumberHtml(detail.value) }} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">Brak dostępnych informacji kontaktowych.</p>
                                    )}
                                </div>

                                {/* Contact Form Section */}
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Napisz do Nas</h2>
                                    <Card className="border-0 shadow-lg bg-gray-50 p-6">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <Label htmlFor="name" className="text-gray-700">
                                                    Imię i Nazwisko
                                                </Label>
                                                <Input type="text" name="name" id="name" value={formState.name} onChange={handleInputChange} required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="email" className="text-gray-700">
                                                    Adres Email
                                                </Label>
                                                <Input type="email" name="email" id="email" value={formState.email} onChange={handleInputChange} required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="subject" className="text-gray-700">
                                                    Temat
                                                </Label>
                                                <Input type="text" name="subject" id="subject" value={formState.subject} onChange={handleInputChange} required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="message" className="text-gray-700">
                                                    Wiadomość
                                                </Label>
                                                <Textarea name="message" id="message" rows={5} value={formState.message} onChange={handleInputChange} required className="mt-1" />
                                            </div>
                                            {formStatus && (
                                                <div className={`p-3 rounded-md text-sm ${formStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {formStatus.message}
                                                </div>
                                            )}
                                            <div>
                                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center">
                                                    <Send className="mr-2 h-5 w-5" /> Wyślij Wiadomość
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>
                </AnimatedSection>
            </main>
        </LayoutWrapper>
    );
}
