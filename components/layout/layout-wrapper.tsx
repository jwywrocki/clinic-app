'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { createSupabaseClient } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

interface MenuItem {
    id: string;
    title: string;
    url: string;
    order_position: number;
    parent_id?: string | null;
}

interface ContactInfo {
    phone: string;
    email: string;
    address: string;
    hours: string;
    emergency_contact?: string;
}

interface LayoutWrapperProps {
    children: React.ReactNode;
    showAccessibilityToolbar?: boolean;
    showCookieConsent?: boolean;
}

let menuCache: MenuItem[] | null = null;
let contactCache: ContactInfo | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function LayoutWrapper({ children, showAccessibilityToolbar = true, showCookieConsent = true }: LayoutWrapperProps) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createSupabaseClient();

    useEffect(() => {
        const fetchLayoutData = async () => {
            try {
                setLoading(true);

                const now = Date.now();
                if (menuCache && contactCache && now - cacheTimestamp < CACHE_DURATION) {
                    setMenuItems(menuCache);
                    setContactInfo(contactCache);
                    setLoading(false);
                    return;
                }

                if (!supabase) return;

                const [menuResult, contactResult] = await Promise.allSettled([
                    supabase.from('menu_items').select('*').eq('is_published', true).order('order_position'),
                    supabase.from('contact_info').select('*').single(),
                ]);

                let fetchedMenu: MenuItem[] = [];
                let fetchedContact: ContactInfo | null = null;

                if (menuResult.status === 'fulfilled' && menuResult.value.data) {
                    fetchedMenu = menuResult.value.data;
                }

                if (contactResult.status === 'fulfilled' && contactResult.value.data) {
                    fetchedContact = contactResult.value.data;
                }

                menuCache = fetchedMenu;
                contactCache = fetchedContact;
                cacheTimestamp = now;

                setMenuItems(fetchedMenu);
                setContactInfo(fetchedContact);
            } catch (error) {
                console.error('Błąd podczas ładowania danych layoutu:', error);

                if (menuCache && contactCache) {
                    setMenuItems(menuCache);
                    setContactInfo(contactCache);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLayoutData();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-white">
            {/* Accessibility Controls - only show for non-admin routes */}
            {showAccessibilityToolbar && !isAdminRoute && <AccessibilityToolbar />}

            {/* Cookie Consent - only show for non-admin routes */}
            {showCookieConsent && !isAdminRoute && <CookieConsent />}

            {/* Header */}
            <Header menuItems={menuItems} />

            {/* Main Content */}
            <main className="pt-20">{children}</main>

            {/* Footer */}
            <Footer menuItems={menuItems} contactInfo={contactInfo} />
        </div>
    );
}
