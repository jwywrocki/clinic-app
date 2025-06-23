'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, Search, Eye, Link as LinkIcon, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import { FadeIn } from '@/components/ui/animation-helpers';

interface SiteSettingsProps {
    onSave?: (data: any) => Promise<void>;
    currentUser?: { id: string } | null;
}

interface SiteSetting {
    id?: string;
    key: string;
    value: string;
    description?: string;
}

export function SiteSettings({ onSave, currentUser }: SiteSettingsProps) {
    const [settings, setSettings] = useState<Record<string, string>>({
        site_title: '',
        site_description: '',
        site_keywords: '',
        site_author: '',
        meta_viewport: 'width=device-width, initial-scale=1',
        meta_language: 'pl',
        meta_charset: 'UTF-8',
        canonical_url: '',
        robots_txt: 'User-agent: *\nAllow: /',
        favicon_url: '/favicon.ico',
        sitemap_url: '/sitemap.xml',
        schema_type: 'MedicalClinic',
        schema_name: '',
        schema_description: '',
        schema_address: '',
        schema_phone: '',
        schema_email: '',
        schema_opening_hours: '',
        h1_title: '',
        meta_title_template: '',
        breadcrumb_enabled: 'true',
        structured_data_enabled: 'true',
    });

    const [loading, setLoading] = useState(true);
    const [savingSeoBasic, setSavingSeoBasic] = useState(false);
    const [savingAdvancedMeta, setSavingAdvancedMeta] = useState(false);
    const [savingSchemaOrg, setSavingSchemaOrg] = useState(false);
    const [savingTechnicalSeo, setSavingTechnicalSeo] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Validation functions
    const validateUrl = (url: string): boolean => {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const validateFaviconUrl = (url: string): boolean => {
        if (!url) return true;

        if (url.startsWith('/')) {
            return true;
        }

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const validateEmail = (email: string): boolean => {
        if (!email) return true; // Allow empty email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        if (!phone) return true; // Allow empty phone
        const phonePattern = /^[\+]?[0-9\s\-\(\)]+$/;
        return phonePattern.test(phone);
    };

    const validateSetting = (key: string, value: string): string | null => {
        switch (key) {
            case 'canonical_url':
            case 'sitemap_url':
                if (value && !validateUrl(value)) {
                    return 'Nieprawidłowy format URL';
                }
                break;
            case 'favicon_url':
                if (value && !validateFaviconUrl(value)) {
                    return 'Nieprawidłowy format URL lub ścieżki';
                }
                break;
            case 'schema_email':
                if (value && !validateEmail(value)) {
                    return 'Nieprawidłowy format adresu email';
                }
                break;
            case 'schema_phone':
                if (value && !validatePhone(value)) {
                    return 'Nieprawidłowy format numeru telefonu';
                }
                break;
            case 'site_title':
            case 'h1_title':
                if (value.length > 60) {
                    return 'Tytuł powinien mieć maksymalnie 60 znaków dla optymalnego SEO';
                }
                break;
            case 'site_description':
            case 'schema_description':
                if (value.length > 160) {
                    return 'Opis powinien mieć maksymalnie 160 znaków dla optymalnego SEO';
                }
                break;
            case 'site_keywords':
                if (value.length > 255) {
                    return 'Słowa kluczowe nie powinny przekraczać 255 znaków';
                }
                break;
            case 'meta_title_template':
                if (value.length > 70) {
                    return 'Szablon meta title powinien mieć maksymalnie 70 znaków';
                }
                break;
        }
        return null;
    };

    const validateAllSettings = (): boolean => {
        const newErrors: Record<string, string> = {};

        Object.entries(settings).forEach(([key, value]) => {
            const error = validateSetting(key, value);
            if (error) {
                console.error(`Validation error for ${key}:`, error);
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/ico', 'image/icon', 'image/png'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
            toast({
                title: 'Błąd',
                description: 'Obsługiwane formaty: .ico, .png',
                variant: 'destructive',
            });
            return;
        }

        const maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            toast({
                title: 'Błąd',
                description: 'Plik jest za duży. Maksymalny rozmiar: 1MB',
                variant: 'destructive',
            });
            return;
        }

        try {
            setUploadingFavicon(true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'favicon');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            handleSettingChange('favicon_url', data.url);

            toast({
                title: 'Sukces',
                description: 'Favicon został przesłany pomyślnie. Odśwież stronę, aby zobaczyć zmiany.',
                variant: 'success',
            });

            setTimeout(() => {
                const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
                if (link) {
                    link.href = data.url;
                }
            }, 500);
        } catch (error) {
            console.error('Error uploading favicon:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się przesłać favicon',
                variant: 'destructive',
            });
        } finally {
            setUploadingFavicon(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                const allSettings = await response.json();
                const siteSettings: Record<string, string> = {};

                allSettings.forEach((setting: SiteSetting) => {
                    if (
                        setting.key.startsWith('site_') ||
                        setting.key.startsWith('meta_') ||
                        setting.key.startsWith('schema_') ||
                        ['favicon_url', 'canonical_url', 'robots_txt', 'sitemap_url', 'h1_title', 'meta_title_template', 'breadcrumb_enabled', 'structured_data_enabled'].includes(setting.key)
                    ) {
                        siteSettings[setting.key] = setting.value || '';
                    }
                });

                setSettings((prev) => ({ ...prev, ...siteSettings }));
            }
        } catch (error) {
            console.error('Error fetching site settings:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się pobrać ustawień witryny.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));

        if (errors[key]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }

        const error = validateSetting(key, value);
        if (error) {
            setErrors((prev) => ({ ...prev, [key]: error }));
        }
    };

    const saveSetting = async (key: string, value: string, description?: string) => {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key,
                    value,
                    description,
                    userId: currentUser?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save setting');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving setting:', error);
            throw error;
        }
    };

    const saveSeoBasicSettings = async () => {
        setSavingSeoBasic(true);
        try {
            const seoBasicSettings = [
                { key: 'site_title', value: settings.site_title, description: 'Tytuł witryny wyświetlany w przeglądarce' },
                { key: 'site_description', value: settings.site_description, description: 'Opis witryny dla wyszukiwarek' },
                { key: 'site_keywords', value: settings.site_keywords, description: 'Słowa kluczowe oddzielone przecinkami' },
                { key: 'site_author', value: settings.site_author, description: 'Autor/właściciel witryny' },
                { key: 'h1_title', value: settings.h1_title, description: 'Główny nagłówek H1 strony' },
                { key: 'meta_title_template', value: settings.meta_title_template, description: 'Szablon meta title' },
            ];

            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settings: seoBasicSettings,
                    userId: currentUser?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save basic SEO settings');
            }

            toast({
                title: 'Sukces',
                description: 'Podstawowe ustawienia SEO zostały zapisane',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving basic SEO settings:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się zapisać podstawowych ustawień SEO',
                variant: 'destructive',
            });
        } finally {
            setSavingSeoBasic(false);
        }
    };

    const saveAdvancedMetaSettings = async () => {
        setSavingAdvancedMeta(true);
        try {
            const advancedMetaSettings = [
                { key: 'meta_viewport', value: settings.meta_viewport, description: 'Ustawienia viewport dla urządzeń mobilnych' },
                { key: 'meta_language', value: settings.meta_language, description: 'Język witryny' },
                { key: 'meta_charset', value: settings.meta_charset, description: 'Kodowanie znaków' },
            ];

            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settings: advancedMetaSettings,
                    userId: currentUser?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save advanced meta settings');
            }

            toast({
                title: 'Sukces',
                description: 'Zaawansowane meta tagi zostały zapisane',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving advanced meta settings:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się zapisać zaawansowanych meta tagów',
                variant: 'destructive',
            });
        } finally {
            setSavingAdvancedMeta(false);
        }
    };

    const saveSchemaOrgSettings = async () => {
        setSavingSchemaOrg(true);
        try {
            const schemaOrgSettings = [
                { key: 'schema_type', value: settings.schema_type, description: 'Typ organizacji w Schema.org' },
                { key: 'schema_name', value: settings.schema_name, description: 'Nazwa organizacji w Schema.org' },
                { key: 'schema_description', value: settings.schema_description, description: 'Opis organizacji w Schema.org' },
                { key: 'schema_address', value: settings.schema_address, description: 'Adres organizacji w Schema.org' },
                { key: 'schema_phone', value: settings.schema_phone, description: 'Telefon organizacji w Schema.org' },
                { key: 'schema_email', value: settings.schema_email, description: 'Email organizacji w Schema.org' },
                { key: 'schema_opening_hours', value: settings.schema_opening_hours, description: 'Godziny otwarcia w Schema.org' },
            ];

            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settings: schemaOrgSettings,
                    userId: currentUser?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save Schema.org settings');
            }

            toast({
                title: 'Sukces',
                description: 'Dane strukturalne Schema.org zostały zapisane',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving Schema.org settings:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się zapisać danych strukturalnych Schema.org',
                variant: 'destructive',
            });
        } finally {
            setSavingSchemaOrg(false);
        }
    };

    const saveTechnicalSeoSettings = async () => {
        setSavingTechnicalSeo(true);
        try {
            const technicalSeoSettings = [
                { key: 'canonical_url', value: settings.canonical_url, description: 'Główny URL witryny (canonical)' },
                { key: 'favicon_url', value: settings.favicon_url, description: 'Ścieżka do favicon' },
                { key: 'sitemap_url', value: settings.sitemap_url, description: 'URL do sitemap XML' },
                { key: 'robots_txt', value: settings.robots_txt, description: 'Zawartość pliku robots.txt' },
                { key: 'breadcrumb_enabled', value: settings.breadcrumb_enabled, description: 'Włączenie breadcrumbs' },
                { key: 'structured_data_enabled', value: settings.structured_data_enabled, description: 'Włączenie danych strukturalnych' },
            ];

            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settings: technicalSeoSettings,
                    userId: currentUser?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save technical SEO settings');
            }

            toast({
                title: 'Sukces',
                description: 'Ustawienia techniczne SEO zostały zapisane',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving technical SEO settings:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się zapisać ustawień technicznych SEO',
                variant: 'destructive',
            });
        } finally {
            setSavingTechnicalSeo(false);
        }
    };

    if (loading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Ładowanie ustawień...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Basic SEO Settings */}
            <FadeIn direction="up" delay={0}>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-600" />
                            Podstawowe ustawienia SEO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="site_title">Tytuł witryny</Label>
                                <Input
                                    id="site_title"
                                    value={settings.site_title}
                                    onChange={(e) => handleSettingChange('site_title', e.target.value)}
                                    placeholder="SPZOZ GOZ Łopuszno - Opieka zdrowotna"
                                    className={`mt-1 ${errors.site_title ? 'border-red-500' : ''}`}
                                />
                                {errors.site_title && <p className="text-xs text-red-500 mt-1">{errors.site_title}</p>}
                                {!errors.site_title && <p className="text-xs text-gray-500 mt-1">Główny tytuł witryny wyświetlany w przeglądarce i wyszukiwarkach (max 60 znaków)</p>}
                            </div>

                            <div>
                                <Label htmlFor="site_description">Opis witryny</Label>
                                <Textarea
                                    id="site_description"
                                    value={settings.site_description}
                                    onChange={(e) => handleSettingChange('site_description', e.target.value)}
                                    placeholder="Samodzielny Publiczny Zakład Opieki Zdrowotnej GOZ w Łopusznie oferuje kompleksową opiekę medyczną..."
                                    rows={3}
                                    className={`mt-1 ${errors.site_description ? 'border-red-500' : ''}`}
                                />
                                {errors.site_description && <p className="text-xs text-red-500 mt-1">{errors.site_description}</p>}
                                {!errors.site_description && <p className="text-xs text-gray-500 mt-1">Opis wyświetlany w wynikach wyszukiwania (max 160 znaków dla optymalnego SEO)</p>}
                            </div>

                            <div>
                                <Label htmlFor="site_keywords">Słowa kluczowe</Label>
                                <Input
                                    id="site_keywords"
                                    value={settings.site_keywords}
                                    onChange={(e) => handleSettingChange('site_keywords', e.target.value)}
                                    placeholder="opieka zdrowotna, lekarz, Łopuszno, SPZOZ, gabinet lekarski"
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Słowa kluczowe oddzielone przecinkami</p>
                            </div>

                            <div>
                                <Label htmlFor="site_author">Autor/Właściciel</Label>
                                <Input
                                    id="site_author"
                                    value={settings.site_author}
                                    onChange={(e) => handleSettingChange('site_author', e.target.value)}
                                    placeholder="SPZOZ GOZ Łopuszno"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
                        <div className="flex justify-end">
                            <Button onClick={saveSeoBasicSettings} disabled={savingSeoBasic} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {savingSeoBasic ? 'Zapisywanie...' : 'Zapisz podstawowe SEO'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </FadeIn>

            {/* Advanced Meta Tags */}
            <FadeIn direction="up" delay={100}>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-600" />
                            Zaawansowane meta tagi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="meta_viewport">Meta Viewport</Label>
                                <Input
                                    id="meta_viewport"
                                    value={settings.meta_viewport}
                                    onChange={(e) => handleSettingChange('meta_viewport', e.target.value)}
                                    placeholder="width=device-width, initial-scale=1"
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Ustawienia viewport dla urządzeń mobilnych</p>
                            </div>

                            <div>
                                <Label htmlFor="meta_language">Język witryny</Label>
                                <select
                                    id="meta_language"
                                    value={settings.meta_language}
                                    onChange={(e) => handleSettingChange('meta_language', e.target.value)}
                                    className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pl">Polski (pl)</option>
                                    <option value="en">English (en)</option>
                                    <option value="de">Deutsch (de)</option>
                                    <option value="fr">Français (fr)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="h1_title">Główny nagłówek H1</Label>
                                <Input
                                    id="h1_title"
                                    value={settings.h1_title}
                                    onChange={(e) => handleSettingChange('h1_title', e.target.value)}
                                    placeholder="Profesjonalna opieka zdrowotna w Łopusznie"
                                    className={`mt-1 ${errors.h1_title ? 'border-red-500' : ''}`}
                                />
                                {errors.h1_title && <p className="text-xs text-red-500 mt-1">{errors.h1_title}</p>}
                                {!errors.h1_title && <p className="text-xs text-gray-500 mt-1">Główny nagłówek strony (max 60 znaków)</p>}
                            </div>

                            <div>
                                <Label htmlFor="meta_title_template">Szablon meta title</Label>
                                <Input
                                    id="meta_title_template"
                                    value={settings.meta_title_template}
                                    onChange={(e) => handleSettingChange('meta_title_template', e.target.value)}
                                    placeholder="%s | SPZOZ GOZ Łopuszno"
                                    className={`mt-1 ${errors.meta_title_template ? 'border-red-500' : ''}`}
                                />
                                {errors.meta_title_template && <p className="text-xs text-red-500 mt-1">{errors.meta_title_template}</p>}
                                {!errors.meta_title_template && <p className="text-xs text-gray-500 mt-1">Szablon dla tytułów podstron (%s = tytuł strony)</p>}
                            </div>
                        </div>
                    </CardContent>
                    <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
                        <div className="flex justify-end">
                            <Button onClick={saveAdvancedMetaSettings} disabled={savingAdvancedMeta} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                {savingAdvancedMeta ? 'Zapisywanie...' : 'Zapisz meta tagi'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </FadeIn>

            {/* Schema.org Structured Data */}
            <FadeIn direction="up" delay={150}>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-purple-600" />
                            Dane strukturalne Schema.org
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="schema_type">Typ organizacji</Label>
                                <select
                                    id="schema_type"
                                    value={settings.schema_type}
                                    onChange={(e) => handleSettingChange('schema_type', e.target.value)}
                                    className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="MedicalOrganization">Organizacja medyczna (MedicalOrganization)</option>
                                    <option value="MedicalClinic">Klinika medyczna (MedicalClinic)</option>
                                    <option value="Hospital">Szpital (Hospital)</option>
                                    <option value="Dentist">Dentysta (Dentist)</option>
                                    <option value="Pharmacy">Apteka (Pharmacy)</option>
                                    <option value="Physician">Gabinet lekarski / Lekarz (Physician)</option>
                                    <option value="HealthAndBeautyBusiness">Placówka zdrowia i urody (HealthAndBeautyBusiness)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="schema_name">Nazwa organizacji</Label>
                                <Input
                                    id="schema_name"
                                    value={settings.schema_name}
                                    onChange={(e) => handleSettingChange('schema_name', e.target.value)}
                                    placeholder="SPZOZ GOZ Łopuszno"
                                    className="mt-1"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="schema_description">Opis organizacji</Label>
                                <Textarea
                                    id="schema_description"
                                    value={settings.schema_description}
                                    onChange={(e) => handleSettingChange('schema_description', e.target.value)}
                                    placeholder="Samodzielny Publiczny Zakład Opieki Zdrowotnej GOZ w Łopusznie..."
                                    rows={2}
                                    className={`mt-1 ${errors.schema_description ? 'border-red-500' : ''}`}
                                />
                                {errors.schema_description && <p className="text-xs text-red-500 mt-1">{errors.schema_description}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="schema_address">Adres</Label>
                                <Input
                                    id="schema_address"
                                    value={settings.schema_address}
                                    onChange={(e) => handleSettingChange('schema_address', e.target.value)}
                                    placeholder="ul. Przykładowa 1, 26-053 Łopuszno"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="schema_phone">Telefon</Label>
                                <Input
                                    id="schema_phone"
                                    value={settings.schema_phone}
                                    onChange={(e) => handleSettingChange('schema_phone', e.target.value)}
                                    placeholder="+48 41 000 00 00"
                                    className={`mt-1 ${errors.schema_phone ? 'border-red-500' : ''}`}
                                />
                                {errors.schema_phone && <p className="text-xs text-red-500 mt-1">{errors.schema_phone}</p>}
                            </div>

                            <div>
                                <Label htmlFor="schema_email">Email</Label>
                                <Input
                                    id="schema_email"
                                    value={settings.schema_email}
                                    onChange={(e) => handleSettingChange('schema_email', e.target.value)}
                                    placeholder="kontakt@gozlopuszno.pl"
                                    className={`mt-1 ${errors.schema_email ? 'border-red-500' : ''}`}
                                />
                                {errors.schema_email && <p className="text-xs text-red-500 mt-1">{errors.schema_email}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="schema_opening_hours">Godziny otwarcia</Label>
                                <Textarea
                                    id="schema_opening_hours"
                                    value={settings.schema_opening_hours}
                                    onChange={(e) => handleSettingChange('schema_opening_hours', e.target.value)}
                                    placeholder="Mo-Fr 08:00-16:00, Sa 08:00-12:00"
                                    rows={2}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: Mo-Fr 08:00-16:00 (ISO 8601)</p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
                        <div className="flex justify-end">
                            <Button onClick={saveSchemaOrgSettings} disabled={savingSchemaOrg} size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Save className="h-4 w-4 mr-2" />
                                {savingSchemaOrg ? 'Zapisywanie...' : 'Zapisz Schema.org'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </FadeIn>

            {/* Technical SEO Settings */}
            <FadeIn direction="up" delay={200}>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-orange-600" />
                            Ustawienia techniczne SEO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="canonical_url">Główny URL witryny (Canonical)</Label>
                                <Input
                                    id="canonical_url"
                                    value={settings.canonical_url}
                                    onChange={(e) => handleSettingChange('canonical_url', e.target.value)}
                                    placeholder="https://gozlopuszno.pl"
                                    className={`mt-1 ${errors.canonical_url ? 'border-red-500' : ''}`}
                                />
                                {errors.canonical_url && <p className="text-xs text-red-500 mt-1">{errors.canonical_url}</p>}
                                {!errors.canonical_url && <p className="text-xs text-gray-500 mt-1">Canonical URL dla SEO (format: https://example.com)</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="favicon_management">Favicon witryny</Label>
                                    <div className="mt-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {settings.favicon_url && (
                                                <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                                                    <img
                                                        src={settings.favicon_url}
                                                        alt="Podgląd favicon"
                                                        className="w-6 h-6"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-600 truncate max-w-[200px]">{settings.favicon_url}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon} className="shrink-0">
                                                {uploadingFavicon ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                        Przesyłanie...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Prześlij favicon
                                                    </>
                                                )}
                                            </Button>
                                            <Input value={settings.favicon_url} onChange={(e) => handleSettingChange('favicon_url', e.target.value)} placeholder="/favicon.ico" className="flex-1" />
                                        </div>
                                        <input ref={faviconInputRef} type="file" accept=".ico,.png" onChange={handleFaviconUpload} className="hidden" />
                                        <p className="text-xs text-gray-500">Obsługiwane formaty: .ico, .png (max 1MB). Rekomendowany rozmiar: 32x32 lub 16x16 pikseli</p>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="sitemap_url">URL Sitemap XML</Label>
                                    <Input
                                        id="sitemap_url"
                                        value={settings.sitemap_url}
                                        onChange={(e) => handleSettingChange('sitemap_url', e.target.value)}
                                        placeholder="/sitemap.xml"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="robots_txt">Zawartość robots.txt</Label>
                                <Textarea id="robots_txt" value={settings.robots_txt} onChange={(e) => handleSettingChange('robots_txt', e.target.value)} rows={6} className="mt-1 font-mono text-sm" />
                                <p className="text-xs text-gray-500 mt-1">Instrukcje dla robotów wyszukiwarek</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="breadcrumb_enabled">Włącz breadcrumbs</Label>
                                    <select
                                        id="breadcrumb_enabled"
                                        value={settings.breadcrumb_enabled}
                                        onChange={(e) => handleSettingChange('breadcrumb_enabled', e.target.value)}
                                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="true">Włączone</option>
                                        <option value="false">Wyłączone</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Nawigacja breadcrumb dla lepszego UX i SEO</p>
                                </div>

                                <div>
                                    <Label htmlFor="structured_data_enabled">Dane strukturalne</Label>
                                    <select
                                        id="structured_data_enabled"
                                        value={settings.structured_data_enabled}
                                        onChange={(e) => handleSettingChange('structured_data_enabled', e.target.value)}
                                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="true">Włączone</option>
                                        <option value="false">Wyłączone</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Automatyczne generowanie JSON-LD</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
                        <div className="flex justify-end">
                            <Button onClick={saveTechnicalSeoSettings} disabled={savingTechnicalSeo} size="sm" className="bg-orange-600 hover:bg-orange-700">
                                <Save className="h-4 w-4 mr-2" />
                                {savingTechnicalSeo ? 'Zapisywanie...' : 'Zapisz techniczne SEO'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </FadeIn>
        </div>
    );
}
