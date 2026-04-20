'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/ui/animated-section';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { sanitizeHtml } from '@/lib/html-sanitizer';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const iconEmojiMap: { [key: string]: string } = {
  heart: '❤️',
  stethoscope: '🩺',
  pill: '💊',
  syringe: '💉',
  bandage: '🩹',
  tooth: '🦷',
  eye: '👁️',
  brain: '🧠',
  lungs: '🫁',
  bone: '🦴',
  microscope: '🔬',
  'x-ray': '🩻',
  thermometer: '🌡️',
  baby: '👶',
  'pregnant-woman': '🤰',
  elderly: '👴',
  wheelchair: '♿',
  ambulance: '🚑',
  hospital: '🏥',
  'first-aid': '🆘',
};

const getIconEmoji = (iconName: string | undefined): string => {
  if (!iconName) {
    return '🏥'; // Default hospital icon
  }

  return iconEmojiMap[iconName] || '🏥';
};

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const servicesData = await response.json();
          // Take first 6 published services for home page
          setServices((servicesData || []).slice(0, 6));
        } else {
          console.error('Error fetching services:', response.statusText);
        }
      } catch (error) {
        console.error('Error in fetchServices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie usług...</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="fadeInUp">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 text-sm font-medium">NASZE SPECJALIZACJE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Kompleksowa opieka medyczna
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Oferujemy szeroki zakres usług medycznych w nowoczesnych warunkach. Nasz zespół
              doświadczonych specjalistów zapewnia najwyższą jakość opieki zdrowotnej.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const iconEmoji = getIconEmoji(service.icon);

            return (
              <AnimatedSection key={service.id} animation="fadeInUp" delay={index * 100}>
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                        <span className="text-3xl">{iconEmoji}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                        {service.title}
                      </h3>
                    </div>
                    <div
                      className="text-gray-600 leading-relaxed prose prose-sm max-w-none flex-1"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(service.description) }}
                    />
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection animation="fadeInUp" delay={600}>
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/uslugi">Zobacz wszystkie usługi</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
