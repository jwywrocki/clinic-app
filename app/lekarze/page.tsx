'use client';

import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { DoctorsList } from '@/components/doctors-list';

interface PageContent {
    id: string;
    title: string;
    content: string;
    slug: string;
    doctors_category?: string;
}

export default function DoctorsPage() {
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createSupabaseClient();
                if (!supabase) {
                    console.warn('Supabase not configured');
                    return;
                }

                const { data: pageData, error: pageError } = await supabase.from('pages').select('*').eq('slug', 'lekarze').single();

                if (pageError) console.error('Error fetching doctors page content:', pageError);
                else setPageContent(pageData);
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

    return (
        <LayoutWrapper>
            <div id="main-content" className="bg-gradient-to-br from-blue-50 to-white">
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
                            <DoctorsList category={pageContent?.doctors_category} />
                        </div>
                    </section>
                </AnimatedSection>

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
            </div>
        </LayoutWrapper>
    );
}
