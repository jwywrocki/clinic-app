'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { NewsItem } from '../types';

interface NewsManagementProps {
    news: NewsItem[];
    onSave: (news: Partial<NewsItem>) => void;
    onDelete: (table: string, id: string) => Promise<void>;
}

export function NewsManagement({ news, onSave, onDelete }: NewsManagementProps) {
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNews) {
            onSave(editingNews);
            setEditingNews(null);
        }
    };

    const handleNewNews = () => {
        setEditingNews({
            id: '',
            title: '',
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
                        <CardTitle>Zarządzaj Aktualnościami</CardTitle>
                        <Button onClick={handleNewNews}>Dodaj Nową Aktualność</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingNews ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="newsTitle">Tytuł</Label>
                                <Input id="newsTitle" value={editingNews.title} onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="newsContent">Treść</Label>
                                <RichTextEditor value={editingNews.content} onChange={(value) => setEditingNews({ ...editingNews, content: value })} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="newsPublished" checked={editingNews.is_published} onChange={(e) => setEditingNews({ ...editingNews, is_published: e.target.checked })} />
                                <Label htmlFor="newsPublished">Opublikowana</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Zapisz</Button>
                                <Button variant="outline" onClick={() => setEditingNews(null)}>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Publikacji</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {news.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    variant={item.is_published ? 'default' : 'secondary'}
                                                    className={item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                >
                                                    {item.is_published ? 'Opublikowana' : 'Szkic'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('pl-PL')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => setEditingNews(item)}>
                                                    Edytuj
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => onDelete('news', item.id)}>
                                                    Usuń
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {news.length === 0 && <p className="text-center text-gray-500 py-4">Brak aktualności.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
