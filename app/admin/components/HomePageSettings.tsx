'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Save, Eye, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface HomePageSettingsProps {
    currentHeroImage?: string;
    onSave?: (data: any) => Promise<void>;
    currentUser?: { id: string } | null;
}

export function HomePageSettings({ currentHeroImage = '/images/baner.webp', onSave, currentUser }: HomePageSettingsProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentImage, setCurrentImage] = useState(currentHeroImage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Błąd',
                description: 'Wybierz plik obrazu (JPEG, PNG, WebP).',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Błąd',
                description: 'Rozmiar pliku nie może przekraczać 5MB.',
                variant: 'destructive',
            });
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('type', 'hero-image');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();

            const updateResponse = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: 'hero_image',
                    value: result.url,
                    userId: currentUser?.id || null,
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update settings');
            }

            setCurrentImage(result.url);
            setSelectedFile(null);
            setPreviewUrl(null);

            toast({
                title: 'Sukces',
                description: 'Zdjęcie strony głównej zostało zaktualizowane.',
                variant: 'success',
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            if (onSave) {
                await onSave({ hero_image: result.url });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się zaktualizować zdjęcia.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleResetToDefault = async () => {
        if (!confirm('Czy na pewno chcesz przywrócić domyślne zdjęcie?')) return;

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: 'hero_image',
                    value: '/images/baner.webp',
                    userId: currentUser?.id || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reset image');
            }

            setCurrentImage('/images/baner.webp');
            setSelectedFile(null);
            setPreviewUrl(null);

            toast({
                title: 'Sukces',
                description: 'Przywrócono domyślne zdjęcie strony głównej.',
                variant: 'success',
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            if (onSave) {
                await onSave({ hero_image: '/images/baner.webp' });
            }
        } catch (error) {
            console.error('Reset error:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się przywrócić domyślnego zdjęcia.',
                variant: 'destructive',
            });
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    Ustawienia strony głównej
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Hero Image */}
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Aktualne zdjęcie w sekcji głównej</Label>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <Image src={currentImage} alt="Aktualne zdjęcie strony głównej" fill className="object-cover" onError={() => setCurrentImage('/images/placeholder.svg')} />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent"></div>
                        <div className="absolute top-2 right-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(currentImage, '_blank')} className="bg-white/90 hover:bg-white">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* File Selection */}
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Wybierz nowe zdjęcie</Label>
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Kliknij aby wybrać plik lub przeciągnij tutaj</p>
                            <p className="text-xs text-gray-500 mt-1">Obsługiwane formaty: JPEG, PNG, WebP (maks. 5MB)</p>
                        </div>

                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                        {/* Preview */}
                        {previewUrl && (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">Podgląd nowego zdjęcia</Label>
                                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image src={previewUrl} alt="Podgląd nowego zdjęcia" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent"></div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleUpload} disabled={isUploading} className="bg-green-600 hover:bg-green-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        {isUploading ? 'Zapisywanie...' : 'Zapisz zdjęcie'}
                                    </Button>
                                    <Button variant="outline" onClick={clearSelection} disabled={isUploading}>
                                        Anuluj
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Actions */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Akcje dodatkowe</p>
                            <p className="text-xs text-gray-500">Zarządzanie zdjęciem strony głównej</p>
                        </div>
                        <Button variant="outline" onClick={handleResetToDefault} className="text-red-600 hover:text-red-700 hover:bg-red-50" disabled={currentImage === '/images/baner.webp'}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Przywróć domyślne
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
