'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { FileText, Stethoscope, Newspaper, ImageIcon, Activity } from 'lucide-react';
import { Page, Service, NewsItem, Doctor } from '../types';

interface DashboardProps {
    pages: Page[];
    services: Service[];
    news: NewsItem[];
    doctors: Doctor[];
}

export function Dashboard({ pages, services, news, doctors }: DashboardProps) {
    return (
        <div className="space-y-8">
            <AnimatedSection animation="fadeInUp">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Summary Cards */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Strony</p>
                                    <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Usługi</p>
                                    <p className="text-3xl font-bold text-gray-900">{services.length}</p>
                                </div>
                                <Stethoscope className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Aktualności</p>
                                    <p className="text-3xl font-bold text-gray-900">{news.length}</p>
                                </div>
                                <Newspaper className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Lekarze</p>
                                    <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
                                </div>
                                <ImageIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeInUp" delay={200}>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Ostatnia aktywność (Strony)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pages.length > 0 ? (
                            <div className="space-y-4">
                                {pages.slice(0, 5).map((page) => (
                                    <div key={page.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{page.title}</p>
                                            <p className="text-sm text-gray-500">Zaktualizowano {new Date(page.updated_at).toLocaleDateString('pl-PL')}</p>
                                        </div>
                                        <Badge variant={page.is_published ? 'default' : 'secondary'} className={page.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                            {page.is_published ? 'Opublikowana' : 'Szkic'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Brak stron do wyświetlenia.</p>
                        )}
                    </CardContent>
                </Card>
            </AnimatedSection>
        </div>
    );
}
