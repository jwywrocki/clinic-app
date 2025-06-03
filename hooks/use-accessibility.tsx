'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface AccessibilitySettings {
    highContrast: boolean;
    fontSize: number;
    reducedMotion: boolean;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    toggleHighContrast: () => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    resetFontSize: () => void;
    announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AccessibilitySettings = {
    highContrast: false,
    fontSize: 16,
    reducedMotion: false,
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
    const [announcements, setAnnouncements] = useState<string[]>([]);

    // Load settings once on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('accessibility-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings((prev) => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Failed to parse accessibility settings:', error);
            }
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setSettings((prev) => ({
            ...prev,
            reducedMotion: prev.reducedMotion || prefersReducedMotion,
        }));
    }, []);

    // Apply to DOM + save if settings change
    useEffect(() => {
        document.documentElement.style.fontSize = `${settings.fontSize}px`;

        document.documentElement.classList.toggle('high-contrast', settings.highContrast);
        if (settings.highContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);

        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    }, [settings]);

    const announceToScreenReader = useCallback((message: string) => {
        setAnnouncements((prev) => [...prev, message]);
        setTimeout(() => {
            setAnnouncements((prev) => prev.slice(1));
        }, 1000);
    }, []);

    const toggleHighContrast = useCallback(() => {
        setSettings((prev) => {
            const updated = { ...prev, highContrast: !prev.highContrast };
            announceToScreenReader(`High contrast mode ${updated.highContrast ? 'enabled' : 'disabled'}`);
            return updated;
        });
    }, [announceToScreenReader]);

    const increaseFontSize = useCallback(() => {
        setSettings((prev) => {
            if (prev.fontSize < 24) {
                const newSize = prev.fontSize + 2;
                announceToScreenReader(`Font size increased to ${newSize} pixels`);
                return { ...prev, fontSize: newSize };
            }
            return prev;
        });
    }, [announceToScreenReader]);

    const decreaseFontSize = useCallback(() => {
        setSettings((prev) => {
            if (prev.fontSize > 12) {
                const newSize = prev.fontSize - 2;
                announceToScreenReader(`Font size decreased to ${newSize} pixels`);
                return { ...prev, fontSize: newSize };
            }
            return prev;
        });
    }, [announceToScreenReader]);

    const resetFontSize = useCallback(() => {
        setSettings((prev) => ({ ...prev, fontSize: 16 }));
        announceToScreenReader('Font size reset to default');
    }, [announceToScreenReader]);

    return (
        <AccessibilityContext.Provider
            value={{
                settings,
                toggleHighContrast,
                increaseFontSize,
                decreaseFontSize,
                resetFontSize,
                announceToScreenReader,
            }}
        >
            {children}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {announcements.map((a, i) => (
                    <div key={i}>{a}</div>
                ))}
            </div>
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
