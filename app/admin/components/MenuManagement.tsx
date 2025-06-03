'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { MenuItem } from '../types';

interface MenuManagementProps {
    menuItems: MenuItem[];
    onSave: (menuItem: Partial<MenuItem>) => void;
    onDelete: (id: string) => Promise<void>;
}

export function MenuManagement({ menuItems, onSave, onDelete }: MenuManagementProps) {
    const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMenuItem) {
            onSave(editingMenuItem);
            setEditingMenuItem(null);
        }
    };

    const handleNewMenuItem = () => {
        setEditingMenuItem({
            id: '',
            title: '',
            url: '',
            order_position: 0,
            is_published: true,
            created_at: '',
            updated_at: '',
        });
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzaj Menu</CardTitle>
                        <Button onClick={handleNewMenuItem}>Dodaj Pozycję Menu</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingMenuItem ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="menuTitle">Tytuł</Label>
                                <Input
                                    id="menuTitle"
                                    value={editingMenuItem.title}
                                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, title: e.target.value })}
                                    placeholder="Nazwa pozycji menu"
                                />
                            </div>
                            <div>
                                <Label htmlFor="menuUrl">URL</Label>
                                <Input
                                    id="menuUrl"
                                    value={editingMenuItem.url}
                                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, url: e.target.value })}
                                    placeholder="/strona lub https://external.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="menuOrder">Pozycja</Label>
                                <Input
                                    id="menuOrder"
                                    type="number"
                                    value={editingMenuItem.order_position}
                                    onChange={(e) =>
                                        setEditingMenuItem({
                                            ...editingMenuItem,
                                            order_position: Number.parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="Kolejność wyświetlania"
                                />
                            </div>
                            <div>
                                <Label htmlFor="menuParent">Element nadrzędny (opcjonalny)</Label>
                                <select
                                    id="menuParent"
                                    value={editingMenuItem.parent_id || ''}
                                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, parent_id: e.target.value || undefined })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Brak (element główny)</option>
                                    {menuItems
                                        .filter((item) => item.id !== editingMenuItem.id)
                                        .map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.title}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="menuPublished"
                                    checked={editingMenuItem.is_published}
                                    onChange={(e) => setEditingMenuItem({ ...editingMenuItem, is_published: e.target.checked })}
                                />
                                <Label htmlFor="menuPublished">Opublikowana</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Zapisz</Button>
                                <Button variant="outline" onClick={() => setEditingMenuItem(null)}>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozycja</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {menuItems
                                        .sort((a, b) => a.order_position - b.order_position)
                                        .map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.parent_id && '↳ '}
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.url}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.order_position}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant={item.is_published ? 'default' : 'secondary'}
                                                        className={item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                    >
                                                        {item.is_published ? 'Opublikowana' : 'Szkic'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => setEditingMenuItem(item)}>
                                                        Edytuj
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                                                        Usuń
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {menuItems.length === 0 && <p className="text-center text-gray-500 py-4">Brak pozycji menu.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
