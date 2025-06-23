'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Users, Heart, Shield, Activity, Stethoscope, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    users: Users,
    heart: Heart,
    activity: Activity,
    shield: Shield,
    stethoscope: Stethoscope,
};

const getIconComponent = (iconName: string | undefined): React.ComponentType<{ className?: string }> => {
    if (!iconName) {
        return CheckCircle;
    }

    if (iconMap[iconName]) {
        return iconMap[iconName];
    }

    const lowerIconName = iconName.toLowerCase();
    if (iconMap[lowerIconName]) {
        return iconMap[lowerIconName];
    }

    return CheckCircle;
};

const colorOptions = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];

export function ServicesSection() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const supabase = createSupabaseClient();
                if (!supabase) {
                    console.warn('Supabase client not initialized');
                    setLoading(false);
                    return;
                }

                const { data: servicesData, error } = await supabase.from('services').select('id, title, description, icon').limit(6); // Limit to 6 services for home page

                if (error) {
                    console.error('Error fetching services:', error);
                } else {
                    setServices(servicesData || []);
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
                            Kompleksowa opieka{' '}
                            <span className="text-blue-600 relative">
                                medyczna
                                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Oferujemy szeroki zakres usług medycznych w nowoczesnych warunkach. Nasz zespół doświadczonych specjalistów zapewnia najwyższą jakość opieki zdrowotnej.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {services.map((service, index) => {
                        const IconComponent = getIconComponent(service.icon);
                        const color = colorOptions[index % colorOptions.length];

                        return (
                            <AnimatedSection key={service.id} animation="fadeInUp" delay={index * 100}>
                                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className={`${color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <IconComponent className="h-8 w-8 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                                        </div>
                                        <div className="text-gray-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
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
