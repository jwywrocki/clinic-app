'use client';

import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client for Doctors page:', error);
    }
}

interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    bio?: string;
    schedule?: string;
}

interface PageContent {
    id: string;
    title: string;
    content: string;
    slug: string;
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!supabase) return;

                const { data: pageData, error: pageError } = await supabase.from('pages').select('*').eq('slug', 'lekarze').single();

                if (pageError) console.error('Error fetching doctors page content:', pageError);
                else setPageContent(pageData);

                const { data: doctorsData, error: doctorsError } = await supabase.from('doctors').select('*').eq('is_active', true).order('last_name', { ascending: true });

                if (doctorsError) {
                    console.error('Error fetching doctors list:', doctorsError);
                } else {
                    setDoctors(doctorsData || []);
                }
            } catch (error) {
                console.error('Error in fetchData (Doctors):', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <LayoutWrapper>
                <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Ładowanie informacji o lekarzach...</p>
                    </div>
                </div>
            </LayoutWrapper>
        );
    }
    console.log('Doctors data fetched:', doctors);
    return (
        <LayoutWrapper>
            <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
                <AnimatedSection animation="fadeInUp">
                    <section className="py-20">
                        <div className="container mx-auto px-4 text-center">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">Nasz Zespół</Badge>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{pageContent?.title || 'Poznaj Naszych Lekarzy'}</h1>
                            <div
                                className="text-xl text-gray-600 max-w-3xl mx-auto prose prose-xl max-w-none text-center"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        pageContent?.content ||
                                        'W SPZOZ GOZ Łopuszno pracuje zespół wykwalifikowanych i doświadczonych lekarzy różnych specjalizacji, gotowych nieść pomoc i zapewnić najlepszą opiekę medyczną.',
                                }}
                            />
                        </div>
                    </section>
                </AnimatedSection>

                <AnimatedSection animation="fadeInUp" delay={200}>
                    <section className="py-10 bg-white">
                        <div className="container mx-auto px-4">
                            {doctors.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {doctors.map((doctor) => (
                                        <Card key={doctor.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                                            <CardHeader>
                                                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                                                    Dr. {doctor.first_name} {doctor.last_name}
                                                    <Badge variant="secondary" className="m-2 mt-2 bg-blue-100 text-blue-700 text-center">
                                                        {doctor.specialization}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-left space-y-3">
                                                <p className="text-gray-600 line-clamp-3">{doctor.bio || 'Doświadczony specjalista w swojej dziedzinie.'}</p>
                                                {doctor.schedule && <div className="text-sm text-gray-500 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: doctor.schedule }} />}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-xl text-gray-500">Obecnie nie ma dostępnych informacji o lekarzach. Prosimy spróbować później.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </AnimatedSection>
                <AnimatedSection animation="fadeInUp" delay={300}>
                    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Chcesz umówić wizytę?</h2>
                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Nasi specjaliści są do Twojej dyspozycji. Skontaktuj się z rejestracją, aby ustalić dogodny termin.</p>
                            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                                <Link href="/kontakt#formularz">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Umów się na wizytę
                                </Link>
                            </Button>
                        </div>
                    </section>
                </AnimatedSection>
            </main>
        </LayoutWrapper>
    );
}
