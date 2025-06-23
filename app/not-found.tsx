'use client';

import Link from 'next/link';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <LayoutWrapper>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
                <div className="container mx-auto px-4 py-16">
                    <AnimatedSection animation="fadeInUp">
                        <div className="max-w-2xl mx-auto text-center">
                            {/* 404 Number */}
                            <div className="mb-8" aria-hidden="true">
                                <h1 className="text-9xl md:text-[12rem] font-bold text-blue-600 opacity-20 leading-none">404</h1>
                            </div>

                            {/* Error Message */}
                            <AnimatedSection animation="fadeInUp" delay={200}>
                                <div className="mb-8">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Strona nie została znaleziona</h1>
                                    <p className="text-lg text-gray-600 mb-6">Przepraszamy, ale strona, której szukasz, nie istnieje lub została przeniesiona.</p>
                                </div>
                            </AnimatedSection>

                            {/* Action Buttons */}
                            <AnimatedSection animation="fadeInUp" delay={400}>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                        <Link href="/">
                                            <Home className="h-5 w-5 mr-2" aria-hidden="true" />
                                            <span>Strona główna</span>
                                        </Link>
                                    </Button>

                                    <Button asChild variant="outline" size="lg">
                                        <Link href="/kontakt">
                                            <Search className="h-5 w-5 mr-2" aria-hidden="true" />
                                            <span>Kontakt</span>
                                        </Link>
                                    </Button>

                                    <Button variant="ghost" size="lg" onClick={() => window.history.back()}>
                                        <ArrowLeft className="h-5 w-5 mr-2" aria-hidden="true" />
                                        <span>Wróć</span>
                                    </Button>
                                </div>
                            </AnimatedSection>

                            {/* Helpful Links */}
                            <AnimatedSection animation="fadeInUp" delay={600}>
                                <div className="p-6 bg-white rounded-2xl shadow-lg">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Może Cię zainteresuje:</h2>
                                    <nav aria-label="Pomocne linki">
                                        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <li>
                                                <Link href="/o-nas" className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded hover:bg-blue-50 block">
                                                    O nas
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/uslugi" className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded hover:bg-blue-50 block">
                                                    Usługi
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/lekarze" className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded hover:bg-blue-50 block">
                                                    Lekarze
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/aktualnosci" className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded hover:bg-blue-50 block">
                                                    Aktualności
                                                </Link>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </AnimatedSection>

                            {/* Contact Info */}
                            <AnimatedSection animation="fadeInUp" delay={800}>
                                <div className="mt-8 text-sm text-gray-500">
                                    <p>Jeśli problem będzie się powtarzał, skontaktuj się z nami:</p>
                                    <p className="mt-2">
                                        <strong>Tel:</strong> +48 41 391 40 27 | <strong>Email:</strong> rejestracja@gozlopuszno.pl
                                    </p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </LayoutWrapper>
    );
}
