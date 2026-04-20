'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Home } from 'lucide-react';
import Link from 'next/link';

const navigationItems = [
  { segment: 'dashboard', label: 'Panel główny' },
  { segment: 'pages', label: 'Strony' },
  { segment: 'news', label: 'Aktualności' },
  { segment: 'services', label: 'Usługi' },
  { segment: 'doctors', label: 'Lekarze' },
  { segment: 'surveys', label: 'Ankiety' },
  { segment: 'menus', label: 'Menu' },
  { segment: 'contact', label: 'Kontakt' },
  { segment: 'users', label: 'Użytkownicy' },
  { segment: 'settings', label: 'Ustawienia' },
];

/** Deduces the page title from the current URL, no prop needed. */
export function Header() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings?key=site_title')
      .then(res => setIsConnected(res.ok))
      .catch(() => setIsConnected(false));
  }, []);

  const currentLabel =
    navigationItems.find(item => pathname?.includes(`/admin/${item.segment}`))?.label ??
    'Panel główny';

  return (
    <AnimatedSection animation="fadeInUp">
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentLabel}</h1>
            <p className="text-gray-600">Zarządzaj treścią swojej strony internetowej</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              className={`${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
            >
              {isConnected ? 'Baza danych połączona' : 'Tryb demo'}
            </Badge>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors flex items-center"
            >
              <Home className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
    </AnimatedSection>
  );
}
