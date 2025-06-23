'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

interface HeaderProps {
    activeTab: string;
}

const navigationItems = [
    { id: 'dashboard', label: 'Panel główny' },
    { id: 'pages', label: 'Strony' },
    { id: 'news', label: 'Aktualności' },
    { id: 'services', label: 'Usługi' },
    { id: 'doctors', label: 'Lekarze' },
    { id: 'surveys', label: 'Ankiety' },
    { id: 'menus', label: 'Menu' },
    { id: 'contact', label: 'Kontakt' },
    { id: 'users', label: 'Użytkownicy' },
];

export function Header({ activeTab }: HeaderProps) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const supabase = createSupabaseClient();
        setIsConnected(!!supabase);
    }, []);

    return (
        <AnimatedSection animation="fadeInUp">
            <header className="bg-white shadow-sm border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{navigationItems.find((item) => item.id === activeTab)?.label || 'Panel główny'}</h1>
                        <p className="text-gray-600">Zarządzaj treścią swojej strony internetowej</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className={`${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{isConnected ? 'Baza danych połączona' : 'Tryb demo'}</Badge>
                        <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center">
                            <Home className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </header>
        </AnimatedSection>
    );
}
