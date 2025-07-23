import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/database';
import { getPublishedSurveyForPage } from '@/lib/surveys-db';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SurveyWidget } from '@/components/survey-widget';
import { DoctorsList } from '@/components/doctors-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: {
        slug: string;
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;

    const systemRoutes = ['login', 'admin', 'api', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml'];

    if (systemRoutes.includes(slug)) {
        notFound();
    }

    const page = await getPageBySlug(slug);

    if (!page) {
        notFound();
    }

    // Pre-fetch survey data server-side if page has survey
    let surveyData = null;
    if (page.survey_id) {
        try {
            surveyData = await getPublishedSurveyForPage(page.survey_id);
        } catch (error) {
            console.error('Error pre-fetching survey:', error);
        }
    }

    if (page.doctors_category && page.doctors_category !== 'none') {
        return (
            <LayoutWrapper>
                <div className="bg-gradient-to-br from-blue-50 to-white">
                    <AnimatedSection animation="fadeInUp">
                        <section className="py-20">
                            <div className="container mx-auto px-4 text-center">
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">Nasz Zespół</Badge>
                                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{page.title}</h1>
                                <div
                                    className="text-xl text-gray-600 max-w-3xl mx-auto prose prose-xl max-w-none text-center"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            page.content ||
                                            'W SPZOZ GOZ Łopuszno pracuje zespół wykwalifikowanych i doświadczonych specjalistów, gotowych nieść pomoc i zapewnić najlepszą opiekę medyczną.',
                                    }}
                                />
                            </div>
                        </section>
                    </AnimatedSection>

                    <AnimatedSection animation="fadeInUp" delay={200}>
                        <section className="py-10 bg-white">
                            <div className="container mx-auto px-4">
                                <DoctorsList category={page.doctors_category} />
                            </div>
                        </section>
                    </AnimatedSection>

                    {page.survey_id && surveyData && (
                        <AnimatedSection animation="fadeInUp" delay={300}>
                            <section className="py-10 bg-gray-50">
                                <div className="container mx-auto px-4">
                                    <SurveyWidget surveyId={page.survey_id} />
                                </div>
                            </section>
                        </AnimatedSection>
                    )}

                    <AnimatedSection animation="fadeInUp" delay={400}>
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
                </div>
            </LayoutWrapper>
        );
    }

    return (
        <LayoutWrapper>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                <div className="container mx-auto px-4 py-16">
                    <AnimatedSection animation="fadeInUp">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{page.title}</h1>
                                {page.excerpt && <div className="text-xl text-gray-600 max-w-3xl mx-auto prose prose-lg" dangerouslySetInnerHTML={{ __html: page.excerpt }} />}
                            </div>

                            {page.content && (
                                <AnimatedSection animation="fadeInUp" delay={200}>
                                    <div className="bg-white rounded-2xl shadow-lg p-8">
                                        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
                                    </div>
                                </AnimatedSection>
                            )}

                            {page.survey_id && (
                                <AnimatedSection animation="fadeInUp" delay={400}>
                                    <div className="mt-8">
                                        <SurveyWidget surveyId={page.survey_id} preloadedSurvey={surveyData} />
                                    </div>
                                </AnimatedSection>
                            )}
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </LayoutWrapper>
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;

    try {
        const page = await getPageBySlug(slug);

        if (!page) {
            return {
                title: 'Strona nie znaleziona - GOZ Łopuszno',
                description: 'Strona, której szukasz, nie została znaleziona.',
            };
        }

        return {
            title: `${page.title} - GOZ Łopuszno`,
            description: page.excerpt || page.title,
        };
    } catch (error) {
        return {
            title: 'Błąd - GOZ Łopuszno',
            description: 'Wystąpił błąd podczas ładowania strony.',
        };
    }
}
