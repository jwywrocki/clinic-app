'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Contrast, ZoomIn, ZoomOut, RotateCcw, Settings, X } from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useState } from 'react';

interface AccessibilityToolbarProps {
    variant?: 'header' | 'floating';
    className?: string;
}

export function AccessibilityToolbar({ variant = 'floating', className = '' }: AccessibilityToolbarProps) {
    const { settings, toggleHighContrast, increaseFontSize, decreaseFontSize, resetFontSize, announceToScreenReader } = useAccessibility();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleContrast = () => {
        toggleHighContrast();
        announceToScreenReader(settings.highContrast ? 'Wysoki kontrast wyłączony' : 'Wysoki kontrast włączony');
    };

    const handleIncreaseFontSize = () => {
        increaseFontSize();
        announceToScreenReader(`Rozmiar czcionki zwiększony do ${settings.fontSize + 2} pikseli`);
    };

    const handleDecreaseFontSize = () => {
        decreaseFontSize();
        announceToScreenReader(`Rozmiar czcionki zmniejszony do ${settings.fontSize - 2} pikseli`);
    };

    const handleResetFontSize = () => {
        resetFontSize();
        announceToScreenReader('Rozmiar czcionki przywrócony do domyślnego');
    };

    if (variant === 'header') {
        return (
            <div className={`bg-blue-900 text-white border-b-2 border-blue-800 ${className}`}>
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-blue-100">Narzędzia dostępności:</span>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleContrast}
                                    aria-label={`${settings.highContrast ? 'Wyłącz' : 'Włącz'} tryb wysokiego kontrastu`}
                                    aria-pressed={settings.highContrast}
                                    className="text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 border border-blue-700"
                                >
                                    <Contrast className="h-4 w-4 mr-2" />
                                    {settings.highContrast ? 'Wyłącz' : 'Włącz'} wysoki kontrast
                                </Button>

                                <div className="flex items-center border border-blue-700 rounded">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDecreaseFontSize}
                                        aria-label="Zmniejsz rozmiar czcionki"
                                        disabled={settings.fontSize <= 12}
                                        className="text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-r-none"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>

                                    <Badge className="px-3 py-1 text-blue-100 bg-blue-800 text-xs font-medium min-w-[3rem] text-center border-0">{settings.fontSize}px</Badge>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleIncreaseFontSize}
                                        aria-label="Zwiększ rozmiar czcionki"
                                        disabled={settings.fontSize >= 24}
                                        className="text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-l-none"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFontSize}
                                    aria-label="Przywróć domyślny rozmiar czcionki"
                                    className="text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 border border-blue-700"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-4 right-4 z-[100] ${className}`}>
            {!isExpanded ? (
                <Button
                    onClick={() => setIsExpanded(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg border-2 border-blue-500 focus:ring-4 focus:ring-blue-300"
                    aria-label="Otwórz narzędzia dostępności"
                    title="Narzędzia dostępności"
                >
                    <Settings className="h-6 w-6" />
                </Button>
            ) : (
                <Card className="bg-white shadow-2xl border-2 border-blue-200 min-w-[280px]">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 text-lg">Dostępność</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(false)}
                                aria-label="Zamknij narzędzia dostępności"
                                className="text-gray-500 hover:text-gray-700 focus:ring-4 focus:ring-blue-300"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* High Contrast Toggle */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Wysoki kontrast</span>
                                <Button
                                    variant={settings.highContrast ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={handleToggleContrast}
                                    aria-label={`${settings.highContrast ? 'Wyłącz' : 'Włącz'} tryb wysokiego kontrastu`}
                                    aria-pressed={settings.highContrast}
                                    className="focus:ring-4 focus:ring-blue-300"
                                >
                                    <Contrast className="h-4 w-4 mr-2" />
                                    {settings.highContrast ? 'Włączony' : 'Wyłączony'}
                                </Button>
                            </div>

                            {/* Font Size Controls */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Rozmiar czcionki</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {settings.fontSize}px
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDecreaseFontSize}
                                        disabled={settings.fontSize <= 12}
                                        aria-label="Zmniejsz rozmiar czcionki"
                                        className="flex-1 focus:ring-4 focus:ring-blue-300"
                                    >
                                        <ZoomOut className="h-4 w-4 mr-1" />
                                        Mniejszy
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleIncreaseFontSize}
                                        disabled={settings.fontSize >= 24}
                                        aria-label="Zwiększ rozmiar czcionki"
                                        className="flex-1 focus:ring-4 focus:ring-blue-300"
                                    >
                                        <ZoomIn className="h-4 w-4 mr-1" />
                                        Większy
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFontSize}
                                    className="w-full mt-2 text-xs focus:ring-4 focus:ring-blue-300"
                                    aria-label="Przywróć domyślny rozmiar czcionki"
                                >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Przywróć domyślny
                                </Button>
                            </div>

                            {/* Instructions */}
                            <div className="text-xs text-gray-500 pt-2 border-t">
                                <p>Użyj klawisza Tab do nawigacji klawiaturą</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
