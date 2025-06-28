'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { MenuItem } from '@/lib/types/menu';

interface MenuManagementProps {
    menuItems: MenuItem[];
    onSave: (menuItem: Partial<MenuItem>) => void;
    onDelete: (id: string) => Promise<void>;
    onUpdateOrder?: (updatedItems: MenuItem[]) => void;
    isSaving?: boolean;
}

export function MenuManagement({ menuItems, onSave, onDelete, onUpdateOrder, isSaving = false }: MenuManagementProps) {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        url: '',
        order_position: 1,
        parent_id: '',
        is_published: true,
    });

    const organizeMenuHierarchy = (items: MenuItem[]): MenuItem[] => {
        const parents = items.filter((item) => !item.parent_id);
        const children = items.filter((item) => item.parent_id);

        const organized: MenuItem[] = [];

        parents.forEach((parent) => {
            organized.push(parent);
            const parentChildren = children.filter((child) => child.parent_id === parent.id);
            organized.push(...parentChildren);
        });

        return organized;
    };

    const organizedMenuItems = useMemo(() => {
        const sortedItems = [...menuItems].sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
        return organizeMenuHierarchy(sortedItems);
    }, [menuItems]);

    const resetForm = () => {
        setFormData({
            title: '',
            url: '',
            order_position: 1,
            parent_id: '',
            is_published: true,
        });
        setEditingItem(null);
        setIsFormVisible(false);
    };

    const handleEdit = (item: MenuItem) => {
        setFormData({
            title: item.title || '',
            url: item.url || '',
            order_position: item.order_position || 1,
            parent_id: item.parent_id || '',
            is_published: item.is_published ?? true,
        });
        setEditingItem(item);
        setIsFormVisible(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        const dataToSave = {
            ...formData,
            parent_id: formData.parent_id || undefined,
            id: editingItem?.id,
        };

        onSave(dataToSave);
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten element menu?')) {
            await onDelete(id);
        }
    };

    const generatePositionOptions = () => {
        const options = [{ value: '1', label: '1 - Na początku' }];

        organizedMenuItems.forEach((item, index) => {
            if (!item.parent_id) {
                options.push({
                    value: String(index + 2),
                    label: `${index + 2} - Po "${item.title}"`,
                });
            }
        });

        return options;
    };

    const generateParentOptions = () => {
        const parents = menuItems.filter((item) => !item.parent_id);
        return [
            { value: '', label: 'Brak (element główny)' },
            ...parents.map((parent) => ({
                value: parent.id,
                label: parent.title || 'Bez nazwy',
            })),
        ];
    };

    return (
        <AnimatedSection>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzanie Menu</CardTitle>
                        <Button onClick={() => setIsFormVisible(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj element menu
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Formularz */}
                    {isFormVisible && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{editingItem ? 'Edytuj element menu' : 'Dodaj nowy element menu'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Tytuł *</Label>
                                            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Wprowadź tytuł" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="url">URL</Label>
                                            <Input id="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="np. /strona lub https://..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="order_position">Pozycja</Label>
                                            <select
                                                id="order_position"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.order_position}
                                                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                                            >
                                                {generatePositionOptions().map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="parent_id">Element nadrzędny</Label>
                                            <select
                                                id="parent_id"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.parent_id}
                                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                            >
                                                {generateParentOptions().map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_published"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                            className="h-4 w-4 rounded"
                                        />
                                        <Label htmlFor="is_published">Opublikowane</Label>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? 'Zapisywanie...' : editingItem ? 'Zaktualizuj' : 'Dodaj'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
                                            Anuluj
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista elementów menu */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {organizedMenuItems.map((item) => {
                                    const isChild = !!item.parent_id;
                                    return (
                                        <tr key={item.id} className={`hover:bg-gray-50 ${isChild ? 'bg-gray-50/50' : ''}`}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${isChild ? 'pl-16' : ''}`}>
                                                <div className="flex items-center">
                                                    {isChild && <span className="text-gray-400 mr-2">↳</span>}
                                                    <span className={isChild ? 'font-normal' : 'font-semibold'}>{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.url || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <Badge
                                                    variant={item.is_published ? 'default' : 'secondary'}
                                                    className={item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                >
                                                    {item.is_published ? 'Opublikowane' : 'Ukryte'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)} title="Edytuj element menu">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Usuń element menu"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {organizedMenuItems.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Brak elementów menu</h3>
                                    <p className="text-sm">Rozpocznij od dodania pierwszego elementu menu.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
