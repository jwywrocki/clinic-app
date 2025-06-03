import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/database';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';

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

    return (
        <LayoutWrapper>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
                        </div>
                    </AnimatedSection>
                </div>
            </main>
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
