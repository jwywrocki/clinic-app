'use client';

import { useState, useMemo, useEffect } from 'react';
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
        no_link: false,
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

    useEffect(() => {
        if (!editingItem) {
            setFormData((prev) => ({ ...prev, order_position: 1 }));
        }
    }, [formData.parent_id, editingItem]);

    const resetForm = () => {
        setFormData({
            title: '',
            url: '',
            order_position: 1,
            parent_id: '',
            is_published: true,
            no_link: false,
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
            no_link: !item.url,
        });
        setEditingItem(item);
        setIsFormVisible(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        const dataToSave = {
            ...formData,
            url: formData.no_link ? null : formData.url || null,
            parent_id: formData.parent_id || undefined,
            id: editingItem?.id,
        };

        if (editingItem && formData.order_position !== editingItem.order_position) {
            const updatedItems = reorderMenuItems(dataToSave);
            onUpdateOrder?.(updatedItems);
        } else if (!editingItem && formData.order_position > 1) {
            const updatedItems = reorderMenuItemsForNewItem(dataToSave);
            if (onUpdateOrder) {
                await new Promise<void>((resolve) => {
                    onUpdateOrder(updatedItems);
                    setTimeout(() => {
                        onSave(dataToSave);
                        resolve();
                    }, 100);
                });
            } else {
                onSave(dataToSave);
            }
        } else {
            onSave(dataToSave);
        }

        resetForm();
    };

    const reorderMenuItems = (updatedItem: Partial<MenuItem>): MenuItem[] => {
        if (!editingItem || !updatedItem.id) return menuItems;

        const newPosition = updatedItem.order_position || 1;
        const oldPosition = editingItem.order_position || 1;
        const parentId = updatedItem.parent_id || null;
        const oldParentId = editingItem.parent_id || null;

        const updatedItems = [...menuItems];

        const editingIndex = updatedItems.findIndex((item) => item.id === editingItem.id);
        if (editingIndex === -1) return menuItems;

        updatedItems[editingIndex] = {
            ...editingItem,
            ...updatedItem,
            parent_id: parentId,
            order_position: newPosition,
            created_at: editingItem.created_at,
            updated_at: new Date().toISOString(),
        } as MenuItem;

        if (oldParentId !== parentId) {
            const oldGroupItems = menuItems.filter((item) => (item.parent_id || null) === oldParentId && item.id !== editingItem.id);
            oldGroupItems.sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

            oldGroupItems.forEach((item, index) => {
                const itemIndex = updatedItems.findIndex((i) => i.id === item.id);
                if (itemIndex !== -1) {
                    updatedItems[itemIndex] = {
                        ...item,
                        order_position: index + 1,
                        updated_at: new Date().toISOString(),
                    };
                }
            });
        }

        const currentGroupItems = menuItems.filter((item) => (item.parent_id || null) === parentId && item.id !== editingItem.id);
        currentGroupItems.sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

        if (oldParentId === parentId) {
            currentGroupItems.forEach((item) => {
                const currentPos = item.order_position || 0;
                let newPos = currentPos;

                if (oldPosition < newPosition) {
                    if (currentPos > oldPosition && currentPos <= newPosition) {
                        newPos = currentPos - 1;
                    }
                } else if (oldPosition > newPosition) {
                    if (currentPos >= newPosition && currentPos < oldPosition) {
                        newPos = currentPos + 1;
                    }
                }

                const itemIndex = updatedItems.findIndex((i) => i.id === item.id);
                if (itemIndex !== -1 && newPos !== currentPos) {
                    updatedItems[itemIndex] = {
                        ...item,
                        order_position: newPos,
                        updated_at: new Date().toISOString(),
                    };
                }
            });
        } else {
            currentGroupItems.forEach((item) => {
                const currentPos = item.order_position || 0;
                if (currentPos >= newPosition) {
                    const itemIndex = updatedItems.findIndex((i) => i.id === item.id);
                    if (itemIndex !== -1) {
                        updatedItems[itemIndex] = {
                            ...item,
                            order_position: currentPos + 1,
                            updated_at: new Date().toISOString(),
                        };
                    }
                }
            });
        }

        return updatedItems;
    };

    const reorderMenuItemsForNewItem = (newItem: Partial<MenuItem>): MenuItem[] => {
        const targetPosition = newItem.order_position || 1;
        const parentId = newItem.parent_id || null;

        const sameLevelItems = menuItems.filter((item) => (item.parent_id || null) === parentId);

        sameLevelItems.sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

        const updatedItems = [...menuItems];

        sameLevelItems.forEach((item) => {
            if ((item.order_position || 0) >= targetPosition) {
                const itemIndex = updatedItems.findIndex((i) => i.id === item.id);
                if (itemIndex !== -1) {
                    updatedItems[itemIndex] = {
                        ...item,
                        order_position: (item.order_position || 0) + 1,
                        updated_at: new Date().toISOString(),
                    };
                }
            }
        });

        return updatedItems;
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten element menu?')) {
            await onDelete(id);
        }
    };

    const generatePositionOptions = () => {
        const options = [{ value: '1', label: '1 - Na początku' }];

        if (formData.parent_id) {
            const parentItem = menuItems.find((item) => item.id === formData.parent_id);
            const siblingsInParent = menuItems.filter((item) => item.parent_id === formData.parent_id);

            if (parentItem) {
                siblingsInParent.forEach((item, index) => {
                    if (!editingItem || item.id !== editingItem.id) {
                        options.push({
                            value: String(index + 2),
                            label: `${index + 2} - Po "${item.title}"`,
                        });
                    }
                });
            }
        } else {
            const mainItems = organizedMenuItems.filter((item) => !item.parent_id);
            mainItems.forEach((item, index) => {
                if (!editingItem || item.id !== editingItem.id) {
                    options.push({
                        value: String(index + 2),
                        label: `${index + 2} - Po "${item.title}"`,
                    });
                }
            });
        }

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
                                            <div className="flex items-center space-x-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="no_link"
                                                    checked={formData.no_link}
                                                    onChange={(e) => setFormData({ ...formData, no_link: e.target.checked, url: e.target.checked ? '' : formData.url })}
                                                    className="h-4 w-4 rounded"
                                                />
                                                <Label htmlFor="no_link">Brak linku (np. kategoria rozwijalna)</Label>
                                            </div>
                                            <Label htmlFor="url">URL</Label>
                                            <Input
                                                id="url"
                                                value={formData.url}
                                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                                placeholder="np. /strona lub https://..."
                                                disabled={formData.no_link}
                                                className={formData.no_link ? 'bg-gray-100' : ''}
                                            />
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
                                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value, order_position: 1 })}
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
