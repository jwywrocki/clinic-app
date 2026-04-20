import type React from 'react';
import { getDB } from '@/lib/db';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SkipLink } from '@/components/ui/skip-link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { sanitizePhoneNumberHtml, stripHtmlTags } from '@/lib/html-sanitizer';
import { ContactForm } from '@/components/contact-form';

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

export default async function ContactPage() {
  const db = getDB();

  // 1. Fetch Page Content
  const pages = await db.findWhere<PageContent>('pages', { slug: 'kontakt', is_published: true });
  const pageContent = pages && pages.length > 0 ? pages[0] : null;

  // 2. Fetch Contact Groups and Details directly
  const dbGroups = await db.findWhere<any>(
    'contact_groups',
    {},
    { orderBy: { column: 'order_position', ascending: true } }
  );

  // Manual join to reconstruct the same shape as API
  let allContactGroups: DisplayableContactGroup[] = [];
  if (dbGroups && dbGroups.length > 0) {
    // Find all details
    const allDetails = await db.findWhere<any>(
      'contact_details',
      {},
      { orderBy: { column: 'order_position', ascending: true } }
    );

    allContactGroups = dbGroups.map((group: any) => {
      const groupDetails = allDetails
        .filter(d => d.group_id === group.id)
        .map(detail => {
          let icon = Mail;
          if (detail.type === 'phone') icon = Phone;
          if (detail.type === 'address') icon = MapPin;
          if (detail.type === 'hours') icon = Clock;
          if (detail.type === 'emergency_contact') icon = AlertTriangle;
          return { ...detail, icon };
        });

      return {
        ...group,
        contact_details: groupDetails,
      };
    });
  }

  // 3. Fetch Google Maps URL
  const mapsSetting = await db.findOne<any>('site_settings', { key: 'google_maps_embed_url' });
  const googleMapsUrl = mapsSetting ? mapsSetting.value : '';

  return (
    <LayoutWrapper>
      <SkipLink href="#main-content">Przejdź do głównej treści</SkipLink>
      <div id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <AnimatedSection animation="fadeInUp">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">Kontakt</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                {pageContent?.title || 'Skontaktuj się z Nami'}
              </h1>
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
                  {/* eRejestracja */}
                  <Card className="border-2 border-blue-500 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="p-6 text-center">
                      <div className="bg-blue-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">eRejestracja Online</h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        Umów wizytę online w naszym systemie eRejestracji
                      </p>
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors w-full"
                        size="sm"
                      >
                        <a
                          href="http://83.3.112.24/portal"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center"
                        >
                          Przejdź do eRejestracji
                          <svg
                            className="ml-2 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </Button>
                    </div>
                  </Card>
                  {allContactGroups.map(group => (
                    <Card key={group.id} className="border border-gray-200 shadow-sm bg-white">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize mb-4">
                          {group.label}
                        </h3>
                        <div className="space-y-4">
                          {group.contact_details.map(detail => (
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
                                    dangerouslySetInnerHTML={{
                                      __html: sanitizePhoneNumberHtml(detail.value),
                                    }}
                                  />
                                ) : detail.type === 'phone' ||
                                  detail.type === 'emergency_contact' ? (
                                  <a
                                    href={`tel:${stripHtmlTags(detail.value).replace(/\s/g, '')}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    dangerouslySetInnerHTML={{
                                      __html: sanitizePhoneNumberHtml(detail.value),
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="text-gray-900 font-medium"
                                    dangerouslySetInnerHTML={{
                                      __html: sanitizePhoneNumberHtml(detail.value),
                                    }}
                                  />
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
                <ContactForm />
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
