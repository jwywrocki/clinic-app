'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedSection } from '@/components/ui/animated-section';
import { FadeIn } from '@/components/ui/animation-helpers';
import { HomePageSettings } from './HomePageSettings';
import { SiteSettings } from './SiteSettings';
import { SystemSettings } from './SystemSettings';
import { Settings as SettingsIcon, Image as ImageIcon, Globe, Database } from 'lucide-react';

interface SettingsProps {
    onSave?: (data: any) => Promise<void>;
    currentUser?: { id: string } | null;
}

export function Settings({ onSave, currentUser }: SettingsProps) {
    const [activeSettingsTab, setActiveSettingsTab] = useState('homepage');

    return (
        <AnimatedSection animation="fadeInUp">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Ustawienia systemu</h1>
                        <p className="text-gray-600">Zarządzaj ustawieniami witryny i systemu</p>
                    </div>
                </div>

                <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="homepage" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Strona główna
                        </TabsTrigger>
                        <TabsTrigger value="site" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Witryna
                        </TabsTrigger>
                        <TabsTrigger value="system" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            System
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="homepage" className="space-y-6">
                        <FadeIn direction="up" delay={0}>
                            <HomePageSettings onSave={onSave} currentUser={currentUser} />
                        </FadeIn>
                    </TabsContent>

                    <TabsContent value="site" className="space-y-6">
                        <FadeIn direction="up" delay={0}>
                            <SiteSettings onSave={onSave} currentUser={currentUser} />
                        </FadeIn>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-6">
                        <FadeIn direction="up" delay={0}>
                            <SystemSettings onSave={onSave} />
                        </FadeIn>
                    </TabsContent>
                </Tabs>
            </div>
        </AnimatedSection>
    );
}
