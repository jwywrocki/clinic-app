'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { ContactGroup, ContactDetail } from '../types';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { stripHtmlTags } from '@/lib/html-sanitizer';
import { PlusCircle, MinusCircle, Edit3, Trash2, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ContactManagementProps {
    contactGroups: ContactGroup[];
    onSaveGroup: (group: ContactGroup) => Promise<void>;
    onDeleteGroup: (groupId: string) => Promise<void>;
    onDeleteDetail: (detailId: string, groupId: string) => Promise<void>;
}

export function ContactManagement({ contactGroups, onSaveGroup, onDeleteGroup, onDeleteDetail }: ContactManagementProps) {
    const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);

    const handleNewGroup = () => {
        setEditingGroup({
            id: 'new-group-temp-id',
            label: '',
            featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contact_details: [],
        });
    };

    const handleSaveGroup = async () => {
        if (editingGroup) {
            const groupToSave = {
                ...editingGroup,
                contact_details: (editingGroup.contact_details || []).map((detail) => ({
                    ...detail,
                    group_id: editingGroup.id,
                })),
            };
            await onSaveGroup(groupToSave);
            setEditingGroup(null);
        }
    };

    const handleAddDetailValue = (groupId: string, type: 'phone' | 'email' | 'address' | 'hours' | 'emergency_contact') => {
        if (!editingGroup) return;

        const newDetail: ContactDetail = {
            id: `new-${Math.random().toString(36).substr(2, 9)}`,
            group_id: editingGroup.id,
            type: type,
            value: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setEditingGroup({
            ...editingGroup,
            contact_details: [...(editingGroup.contact_details || []), newDetail],
        });
    };

    const handleRemoveDetailValue = async (groupId: string, detailId: string) => {
        if (!editingGroup) return;

        if (detailId.startsWith('new-')) {
            setEditingGroup((prev) => ({
                ...prev!,
                contact_details: prev!.contact_details?.filter((d) => d.id !== detailId),
            }));
        } else {
            await onDeleteDetail(detailId, editingGroup.id);
            setEditingGroup((prev) => ({
                ...prev!,
                contact_details: prev!.contact_details?.filter((d) => d.id !== detailId),
            }));
        }
    };

    const handleDetailValueChange = (originalGroupId: string, detailId: string, value: string) => {
        if (!editingGroup) return;

        setEditingGroup((prev) => ({
            ...prev!,
            contact_details: prev!.contact_details?.map((d) => (d.id === detailId ? { ...d, value } : d)),
        }));
    };

    const getContactTypeLabel = (type: string) => {
        switch (type) {
            case 'phone':
                return 'Telefon';
            case 'email':
                return 'Email';
            case 'address':
                return 'Adres';
            case 'hours':
                return 'Godziny';
            case 'emergency_contact':
                return 'Kontakt awaryjny';
            default:
                return type;
        }
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzanie Danymi Kontaktowymi</CardTitle>
                        <Button onClick={handleNewGroup}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Dodaj Grupę Kontaktową
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingGroup ? (
                        <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold">{editingGroup.id ? 'Edytuj' : 'Dodaj'} Grupę Kontaktową</h3>
                            <div>
                                <Label htmlFor="groupLabel">Etykieta Grupy</Label>
                                <Input
                                    id="groupLabel"
                                    value={editingGroup.label}
                                    onChange={(e) => setEditingGroup({ ...editingGroup, label: e.target.value })}
                                    placeholder="Np. Rejestracja Poradni Ogólnej"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="groupFeatured" checked={editingGroup.featured} onCheckedChange={(checked) => setEditingGroup({ ...editingGroup, featured: checked })} />
                                <Label htmlFor="groupFeatured">Wyróżniony (np. w nagłówku/stopce)</Label>
                            </div>

                            <div className="space-y-4">
                                {(editingGroup.contact_details || []).map((detail) => (
                                    <div key={detail.id} className="p-3 border rounded bg-white">
                                        <Label>{getContactTypeLabel(detail.type)}</Label>
                                        {detail.type === 'phone' || detail.type === 'email' ? (
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    value={detail.value}
                                                    onChange={(e) => handleDetailValueChange(editingGroup.id, detail.id, e.target.value)}
                                                    placeholder={detail.type === 'phone' ? 'Numer telefonu' : 'Adres email'}
                                                />
                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveDetailValue(editingGroup.id, detail.id)}>
                                                    <MinusCircle className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ) : detail.type === 'address' || detail.type === 'hours' || detail.type === 'emergency_contact' ? (
                                            <>
                                                <RichTextEditor value={detail.value} onChange={(htmlContent) => handleDetailValueChange(editingGroup.id, detail.id, htmlContent)} />
                                            </>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-2 mt-2">
                                <Button onClick={() => handleAddDetailValue(editingGroup.id, 'phone')} variant="outline" size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Dodaj Telefon
                                </Button>
                                <Button onClick={() => handleAddDetailValue(editingGroup.id, 'email')} variant="outline" size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Dodaj Email
                                </Button>
                                {!editingGroup.contact_details?.find((d) => d.type === 'address') && (
                                    <Button onClick={() => handleAddDetailValue(editingGroup.id, 'address' as any)} variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Dodaj Adres
                                    </Button>
                                )}
                                {!editingGroup.contact_details?.find((d) => d.type === 'hours') && (
                                    <Button onClick={() => handleAddDetailValue(editingGroup.id, 'hours' as any)} variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Dodaj Godziny
                                    </Button>
                                )}
                                {!editingGroup.contact_details?.find((d) => d.type === 'emergency_contact') && (
                                    <Button onClick={() => handleAddDetailValue(editingGroup.id, 'emergency_contact' as any)} variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Dodaj Kontakt Alarmowy
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <Button onClick={handleSaveGroup}>
                                    <Check className="mr-2 h-4 w-4" /> Zapisz Grupę
                                </Button>
                                <Button variant="outline" onClick={() => setEditingGroup(null)}>
                                    <X className="mr-2 h-4 w-4" /> Anuluj
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contactGroups.map((group) => (
                                <Card key={group.id} className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{group.label}</CardTitle>
                                                {group.featured && (
                                                    <Badge variant="secondary" className="mt-1">
                                                        Wyróżniony
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => setEditingGroup(group)}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => onDeleteGroup(group.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {group.contact_details && group.contact_details.length > 0 ? (
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                {group.contact_details.map((detail) => (
                                                    <li key={detail.id} className="flex">
                                                        <span className="font-medium w-28 shrink-0">{getContactTypeLabel(detail.type)}:</span>
                                                        <span className="truncate" title={stripHtmlTags(detail.value)}>
                                                            {stripHtmlTags(detail.value)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">Brak szczegółów kontaktowych dla tej grupy.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {contactGroups.length === 0 && <p className="text-center text-gray-500 py-4">Brak zdefiniowanych grup kontaktowych.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
