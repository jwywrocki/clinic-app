import { getDB } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Phone } from 'lucide-react';
import Link from 'next/link';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SkipLink } from '@/components/ui/skip-link';

interface PageContent {
    id: string;
    title: string;
    content: string;
    slug: string;
    meta_description?: string;
}

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

export default async function ServicesPage() {
    const db = getDB();
    
    // Fetch page data on the server
    const pages = await db.findWhere<PageContent>('pages', { slug: 'uslugi', is_published: true });
    const pageContent = pages && pages.length > 0 ? pages[0] : null;

    // Fetch services on the server
    const services = await db.findWhere<Service>('services', { is_published: true }, {
        orderBy: { column: 'created_at', ascending: true }
    });

    if (!pageContent) {
        return (
            <LayoutWrapper>
                <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600">Nie znaleziono strony.</p>
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
                <AnimatedSection animation="fadeInUp">
                    <section className="py-20">
                        <div className="container mx-auto px-4 text-center">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">Nasze Usługi</Badge>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{pageContent?.title || 'Kompleksowe Usługi Medyczne'}</h1>
                            <div
                                className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 prose prose-xl max-w-none text-center"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        pageContent?.content ||
                                        'W SPZOZ GOZ Łopuszno oferujemy szeroki wachlarz usług medycznych, aby sprostać potrzebom zdrowotnym naszych pacjentów. Nasz doświadczony personel i nowoczesny sprzęt gwarantują najwyższą jakość opieki.',
                                }}
                            />
                        </div>
                    </section>
                </AnimatedSection>

                {/* Services Grid */}
                <AnimatedSection animation="fadeInUp" delay={200}>
                    <section className="py-20 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {services.map((service, index) => {
                                    const iconEmoji = getIconEmoji(service.icon);
                                    return (
                                        <Card key={service.id || index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
                                            <CardHeader className="text-center pb-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-3xl">{iconEmoji}</span>
                                                </div>
                                                <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 flex-1">
                                                <div className="text-gray-600 text-center leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </AnimatedSection>

                {/* CTA Section */}
                <AnimatedSection animation="fadeInUp" delay={300}>
                    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Gotowy zadbać o swoje zdrowie?</h2>
                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                                Skontaktuj się z nami już dziś, aby umówić wizytę lub dowiedzieć się więcej o naszych usługach. Jesteśmy tu, aby Ci pomóc.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                                    <Link href="/kontakt">
                                        <Phone className="h-5 w-5 mr-2" />
                                        Dane kontaktowe
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                </AnimatedSection>
            </div>
        </LayoutWrapper>
    );
}
