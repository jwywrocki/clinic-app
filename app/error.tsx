'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    const getErrorMessage = (error: Error) => {
        const message = error.message.toLowerCase();

        if (message.includes('400') || message.includes('bad request')) {
            return 'Nieprawidłowe żądanie. Sprawdź wprowadzone dane i spróbuj ponownie.';
        }
        if (message.includes('401') || message.includes('unauthorized')) {
            return 'Brak autoryzacji. Zaloguj się ponownie, aby uzyskać dostęp.';
        }
        if (message.includes('403') || message.includes('forbidden')) {
            return 'Brak uprawnień do tej strony. Skontaktuj się z administratorem.';
        }
        if (message.includes('404') || message.includes('not found')) {
            return 'Żądany zasób nie został znaleziony.';
        }
        if (message.includes('500') || message.includes('internal server error')) {
            return 'Wystąpił błąd serwera. Spróbuj ponownie za chwilę.';
        }
        if (message.includes('502') || message.includes('bad gateway')) {
            return 'Błąd bramy serwera. Serwis jest tymczasowo niedostępny.';
        }
        if (message.includes('503') || message.includes('service unavailable')) {
            return 'Serwis jest tymczasowo niedostępny. Spróbuj ponownie za chwilę.';
        }
        if (message.includes('504') || message.includes('gateway timeout')) {
            return 'Przekroczono limit czasu odpowiedzi serwera. Spróbuj ponownie.';
        }
        if (message.includes('fetch') || message.includes('network')) {
            return 'Wystąpił problem z połączeniem. Sprawdź połączenie internetowe i spróbuj ponownie.';
        }
        if (message.includes('timeout')) {
            return 'Żądanie przekroczyło limit czasu. Spróbuj ponownie za chwilę.';
        }
        return 'Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.';
    };

    const getErrorCode = (error: Error) => {
        const message = error.message.toLowerCase();

        if (message.includes('400')) return '400';
        if (message.includes('401')) return '401';
        if (message.includes('403')) return '403';
        if (message.includes('404')) return '404';
        if (message.includes('500')) return '500';
        if (message.includes('502')) return '502';
        if (message.includes('503')) return '503';
        if (message.includes('504')) return '504';
        return 'ERROR';
    };

    const getErrorColor = (error: Error) => {
        const message = error.message.toLowerCase();

        if (message.includes('401') || message.includes('403')) {
            return 'yellow';
        }
        if (message.includes('404')) {
            return 'blue';
        }
        if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
            return 'red';
        }
        return 'red';
    };

    const errorColor = getErrorColor(error);
    const iconColorClass = errorColor === 'yellow' ? 'text-yellow-600' : errorColor === 'blue' ? 'text-blue-600' : 'text-red-600';
    const bgColorClass = errorColor === 'yellow' ? 'bg-yellow-100' : errorColor === 'blue' ? 'bg-blue-100' : 'bg-red-100';
    const buttonColorClass = errorColor === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' : errorColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <LayoutWrapper>
            <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
                <div className="container mx-auto px-4 py-16">
                    <AnimatedSection animation="fadeInUp">
                        <div className="max-w-2xl mx-auto text-center">
                            {/* Error Icon */}
                            <div className="mb-8">
                                <div className={`w-24 h-24 mx-auto ${bgColorClass} rounded-full flex items-center justify-center mb-6`} aria-hidden="true">
                                    <AlertTriangle className={`h-12 w-12 ${iconColorClass}`} />
                                </div>
                                <div className={`text-6xl md:text-8xl font-bold ${iconColorClass} opacity-20 leading-none`} aria-hidden="true">
                                    {getErrorCode(error)}
                                </div>
                            </div>

                            {/* Error Message */}
                            <AnimatedSection animation="fadeInUp" delay={200}>
                                <div className="mb-8">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ups! Coś poszło nie tak</h1>
                                    <p className="text-lg text-gray-600 mb-6">{getErrorMessage(error)}</p>

                                    {process.env.NODE_ENV === 'development' && (
                                        <details className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                                            <summary className="cursor-pointer font-semibold text-gray-700">Szczegóły błędu (tryb deweloperski)</summary>
                                            <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                                {error.message}
                                                {error.stack && `\n\nStack trace:\n${error.stack}`}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </AnimatedSection>

                            {/* Action Buttons */}
                            <AnimatedSection animation="fadeInUp" delay={400}>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Button onClick={reset} size="lg" className={buttonColorClass}>
                                        <RefreshCw className="h-5 w-5 mr-2" aria-hidden="true" />
                                        <span>Spróbuj ponownie</span>
                                    </Button>

                                    <Button asChild variant="outline" size="lg">
                                        <Link href="/">
                                            <Home className="h-5 w-5 mr-2" aria-hidden="true" />
                                            <span>Strona główna</span>
                                        </Link>
                                    </Button>
                                </div>
                            </AnimatedSection>

                            {/* Help Section */}
                            <AnimatedSection animation="fadeInUp" delay={600}>
                                <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Potrzebujesz pomocy?</h2>
                                    <div className="text-gray-600">
                                        <p className="mb-4">Jeśli problem będzie się powtarzał, skontaktuj się z nami:</p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <div>
                                                <strong>Telefon:</strong> +48 41 391 40 27
                                            </div>
                                            <div>
                                                <strong>Email:</strong> rejestracja@gozlopuszno.pl
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>

                            {/* Error ID for support */}
                            {error.digest && (
                                <AnimatedSection animation="fadeInUp" delay={800}>
                                    <div className="mt-8 text-sm text-gray-400">ID błędu: {error.digest}</div>
                                </AnimatedSection>
                            )}
                        </div>
                    </AnimatedSection>
                </div>
            </main>
        </LayoutWrapper>
    );
}
