'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNews } from '@/lib/database';
import Image from 'next/image';
import { sanitizeHtml } from '@/lib/html-sanitizer';

interface NewsArticle {
    id: number | string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    author?: string | null;
}

export function NewsSection() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchNews() {
            try {
                setIsLoading(true);
                const allNews = await getNews();
                if (allNews) {
                    setNews(allNews.slice(0, 3));
                } else {
                    setNews([]);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching news for NewsSection:', err);
                setError('Nie udało się załadować aktualności.');
                setNews([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNews();
    }, []);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Data nieznana';
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection animation="fadeInUp">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-4">
                            <span className="text-blue-600 text-sm font-medium">AKTUALNOŚCI</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Najnowsze informacje</h2>
                    </div>
                </AnimatedSection>

                {isLoading && (
                    <div className="text-center py-10">
                        <p>Ładowanie aktualności...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center py-10 text-red-600">
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && news.length > 0 && (
                    <div className="space-y-8 mb-12 max-w-7xl mx-auto">
                        {news.map((item, index) => (
                            <AnimatedSection key={item.id} animation="fadeInUp" delay={index * 150}>
                                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
                                    {item.image_url && (
                                        <div className="relative overflow-hidden h-48 w-full">
                                            <Image
                                                src={item.image_url || '/placeholder.svg'}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(item.created_at)}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
                                        <div className="prose prose-sm max-w-none text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
                                    </CardContent>
                                </Card>
                            </AnimatedSection>
                        ))}
                    </div>
                )}

                {!isLoading && !error && news.length === 0 && (
                    <AnimatedSection animation="fadeInUp">
                        <div className="text-center py-16">
                            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                                <div className="text-gray-400 mb-4">
                                    <Calendar className="h-16 w-16 mx-auto" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Brak aktualności</h2>
                                <p className="text-gray-600">Obecnie nie ma nowych informacji do wyświetlenia.</p>
                            </div>
                        </div>
                    </AnimatedSection>
                )}

                <AnimatedSection animation="fadeInUp" delay={news.length > 0 ? news.length * 150 : 150}>
                    <div className="text-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            <Link href="/aktualnosci">
                                Zobacz wszystkie aktualności
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
