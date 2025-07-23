'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Award, Shield, Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { FadeIn, SlideIn } from '@/components/ui/animation-helpers';
import { SkipLink } from '@/components/ui/skip-link';

interface PageContent {
    id: string;
    title: string;
    content: string;
    slug: string;
    meta_description?: string;
}

interface TeamMember {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    bio?: string;
}

export default function AboutPage() {
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const supabase = createSupabaseClient();
                if (!supabase) {
                    console.warn('Supabase client not initialized for About page.');
                    setLoading(false);
                    return;
                }

                const { data: pageData, error: pageError } = await supabase.from('pages').select('*').eq('slug', 'o-nas').eq('is_published', true).single();

                if (pageError) {
                    console.error('Error fetching about page content:', pageError);
                } else {
                    setPageContent(pageData);
                }

                const { data: doctorsData, error: doctorsError } = await supabase.from('doctors').select('id, first_name, last_name, specialization, bio').limit(3);

                if (doctorsError) {
                    console.error('Error fetching team members:', doctorsError);
                } else {
                    setTeamMembers(doctorsData || []);
                }
            } catch (error) {
                console.error('Error fetching data for About page:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    const values = [
        {
            icon: Heart,
            title: 'Troska o Pacjenta',
            description: 'Każdego pacjenta traktujemy z empatią, szacunkiem i zrozumieniem.',
        },
        {
            icon: Shield,
            title: 'Bezpieczeństwo',
            description: 'Bezpieczeństwo pacjentów jest naszym najwyższym priorytetem.',
        },
        {
            icon: Award,
            title: 'Profesjonalizm',
            description: 'Dążymy do najwyższych standardów w opiece medycznej i obsłudze.',
        },
        {
            icon: Users,
            title: 'Społeczność',
            description: 'Jesteśmy zaangażowani w służbę i poprawę zdrowia lokalnej społeczności.',
        },
    ];

    if (loading) {
        return (
            <LayoutWrapper>
                <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Ładowanie strony O nas...</p>
                    </div>
                </div>
            </LayoutWrapper>
        );
    }

    return (
        <LayoutWrapper>
            <SkipLink href="#main-content">Przejdź do głównej treści</SkipLink>
            <div id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
                {/* Hero Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <FadeIn direction="left" delay={0}>
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">O Nas</Badge>
                                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{pageContent?.title || 'Poznaj SPZOZ GOZ Łopuszno'}</h1>
                                <div
                                    className="text-xl text-gray-600 leading-relaxed mb-8 prose prose-xl max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            pageContent?.content ||
                                            'Jesteśmy Samodzielnym Publicznym Zakładem Opieki Zdrowotnej, Gminnym Ośrodkiem Zdrowia w Łopusznie. Naszą misją jest zapewnienie kompleksowej i profesjonalnej opieki medycznej dla mieszkańców gminy Łopuszno i okolic.',
                                    }}
                                />
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                                    <Link href="/kontakt">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Skontaktuj się z nami
                                    </Link>
                                </Button>
                            </FadeIn>
                            <FadeIn direction="right" delay={200}>
                                <div className="relative">
                                    <img src="/images/baner.webp?height=500&width=600" alt="Budynek ośrodka zdrowia w Łopusznie" className="rounded-2xl shadow-2xl" />
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* Our Story */}
                <FadeIn direction="up" delay={0} threshold={0.2}>
                    <section className="py-20 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto text-center">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">Nasza Historia</h2>
                                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                    Założony w 1998 roku, SPZOZ GOZ w Łopusznie służy lokalnej społeczności z oddaniem i profesjonalizmem od ponad ćwierćwiecza. Zaczynaliśmy jako niewielka
                                    przychodnia, a dziś jesteśmy nowoczesnym ośrodkiem zdrowia, oferującym szeroki zakres usług medycznych. Nasze podstawowe wartości pozostały niezmienne: zapewnienie
                                    współczującej, wysokiej jakości opieki medycznej każdemu pacjentowi.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Nasz zespół certyfikowanych lekarzy i pracowników służby zdrowia jest zaangażowany w ciągłe podnoszenie kwalifikacji i stosowanie najnowszych osiągnięć medycyny,
                                    jednocześnie zachowując osobiste podejście, które czyni opiekę zdrowotną naprawdę skuteczną.
                                </p>
                            </div>
                        </div>
                    </section>
                </FadeIn>

                {/* Our Values */}
                <section className="py-20 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="container mx-auto px-4">
                        <FadeIn direction="up" delay={0} threshold={0.2}>
                            <div className="text-center mb-16">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nasze Wartości</h2>
                                <p className="text-xl text-gray-600">Zasady, którymi kierujemy się w codziennej pracy</p>
                            </div>
                        </FadeIn>
                        <AnimatedGroup animation="scaleIn" staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => (
                                <Card key={index} className="text-center border-0 shadow-lg bg-white">
                                    <CardHeader>
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <value.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-gray-900">{value.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </AnimatedGroup>
                    </div>
                </section>

                {/* CTA Section */}
                <FadeIn direction="up" delay={0} threshold={0.3}>
                    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Doświadcz Różnicy w SPZOZ GOZ Łopuszno</h2>
                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Dołącz do tysięcy zadowolonych pacjentów, którzy zaufali nam w kwestii opieki zdrowotnej.</p>
                            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                                <Link href="/kontakt">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Umów wizytę już dziś
                                </Link>
                            </Button>
                        </div>
                    </section>
                </FadeIn>
            </div>
        </LayoutWrapper>
    );
}
