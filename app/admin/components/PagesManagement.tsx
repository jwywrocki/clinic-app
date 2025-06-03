'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Page } from '../types';

interface PagesManagementProps {
    pages: Page[];
    onSave: (page: Partial<Page>) => void;
    onDelete: (id: string) => Promise<void>;
}

export function PagesManagement({ pages, onSave, onDelete }: PagesManagementProps) {
    const [editingPage, setEditingPage] = useState<Page | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPage) {
            onSave(editingPage);
            setEditingPage(null);
        }
    };

    const handleNewPage = () => {
        setEditingPage({
            id: '',
            title: '',
            slug: '',
            content: '',
            is_published: false,
            created_at: '',
            updated_at: '',
        });
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzaj Stronami</CardTitle>
                        <Button onClick={handleNewPage}>Dodaj Nową Stronę</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingPage ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="pageTitle">Tytuł</Label>
                                <Input id="pageTitle" value={editingPage.title} onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="pageSlug">Slug (URL)</Label>
                                <Input id="pageSlug" value={editingPage.slug} onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="pageContent">Treść</Label>
                                <RichTextEditor value={editingPage.content} onChange={(value) => setEditingPage({ ...editingPage, content: value })} />
                            </div>
                            <div>
                                <Label htmlFor="pageMetaDescription">Meta Opis (SEO)</Label>
                                <Input id="pageMetaDescription" value={editingPage.meta_description || ''} onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="pagePublished" checked={editingPage.is_published} onChange={(e) => setEditingPage({ ...editingPage, is_published: e.target.checked })} />
                                <Label htmlFor="pagePublished">Opublikowana</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Zapisz</Button>
                                <Button variant="outline" onClick={() => setEditingPage(null)}>
                                    Anuluj
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pages.map((page) => (
                                        <tr key={page.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{page.slug}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    variant={page.is_published ? 'default' : 'secondary'}
                                                    className={page.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                >
                                                    {page.is_published ? 'Opublikowana' : 'Szkic'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => setEditingPage(page)}>
                                                    Edytuj
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => onDelete(page.id)}>
                                                    Usuń
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pages.length === 0 && <p className="text-center text-gray-500 py-4">Brak stron do wyświetlenia.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
