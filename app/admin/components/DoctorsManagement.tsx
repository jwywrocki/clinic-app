'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Doctor } from '@/lib/types/doctors';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface DoctorsManagementProps {
    doctors: Doctor[];
    onSave: (doctor: Partial<Doctor>) => void;
    onDelete: (table: string, id: string) => Promise<void>;
    isSaving?: boolean;
}

export function DoctorsManagement({ doctors, onSave, onDelete, isSaving = false }: DoctorsManagementProps) {
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDoctor) {
            onSave(editingDoctor);
            setEditingDoctor(null);
        }
    };

    const handleNewDoctor = () => {
        setEditingDoctor({
            id: '',
            first_name: '',
            last_name: '',
            specialization: '',
            bio: '',
            image_url: '',
            schedule: '',
            is_active: true,
            order_position: 0,
            created_at: '',
            updated_at: '',
        });
    };

    const handleSaveWithReorder = async (doctor: Partial<Doctor>) => {
        let newDoctors: Doctor[] = [];
        if (!doctor.id) {
            const tempId = 'temp-' + Math.random();
            newDoctors = [...doctors, { ...doctor, id: tempId, order_position: doctor.order_position || 1 } as Doctor];
        } else {
            newDoctors = doctors.map((d) => (d.id === doctor.id ? { ...d, ...doctor } : d));
        }
        newDoctors = newDoctors.filter((d) => d.id !== doctor.id).sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

        const insertAt = (doctor.order_position || 1) - 1;
        newDoctors.splice(insertAt, 0, { ...doctor } as Doctor);

        newDoctors = newDoctors.map((d, idx) => ({ ...d, order_position: idx + 1 }));

        for (const d of newDoctors) {
            if (d.id === doctor.id || doctors.find((old) => old.id === d.id)?.order_position !== d.order_position) {
                await onSave(d);
            }
        }
        setEditingDoctor(null);
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzaj Lekarzami</CardTitle>
                        <Button onClick={handleNewDoctor}>
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj lekarza
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingDoctor ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveWithReorder(editingDoctor);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="doctorName">Imię</Label>
                                <Input id="doctorName" value={editingDoctor.first_name || ''} onChange={(e) => setEditingDoctor({ ...editingDoctor, first_name: e.target.value })} placeholder="Jan" />
                            </div>
                            <div>
                                <Label htmlFor="doctorSurname">Nazwisko</Label>
                                <Input
                                    id="doctorSurname"
                                    value={editingDoctor.last_name || ''}
                                    onChange={(e) => setEditingDoctor({ ...editingDoctor, last_name: e.target.value })}
                                    placeholder="Kowalski"
                                />
                            </div>
                            <div>
                                <Label htmlFor="doctorSpecialty">Specjalizacja</Label>
                                <Input
                                    id="doctorSpecialty"
                                    value={editingDoctor.specialization || ''}
                                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                                    placeholder="Lekarz rodzinny"
                                />
                            </div>
                            <div>
                                <Label htmlFor="doctorDescription">Opis</Label>
                                <Input
                                    id="doctorDescription"
                                    value={editingDoctor.bio || ''}
                                    onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                                    placeholder="Krótki opis lekarza"
                                />
                            </div>
                            <div>
                                <Label htmlFor="doctorImageUrl">URL zdjęcia</Label>
                                <Input
                                    id="doctorImageUrl"
                                    value={editingDoctor.image_url || ''}
                                    onChange={(e) => setEditingDoctor({ ...editingDoctor, image_url: e.target.value })}
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                            <div>
                                <Label htmlFor="doctorSchedule">Godziny przyjęć</Label>
                                <RichTextEditor
                                    value={editingDoctor.schedule || ''}
                                    onChange={(value) => setEditingDoctor({ ...editingDoctor, schedule: value })}
                                    placeholder="Wprowadź godziny przyjęć lekarza..."
                                    className="min-h-[120px]"
                                />
                            </div>
                            <div>
                                <Label>Pozycja na liście</Label>
                                <Select
                                    value={(() => {
                                        if (!editingDoctor.id || doctors.length === 0) return '';
                                        if (editingDoctor.order_position === 1) return 'first';
                                        const prev = doctors
                                            .filter((d) => d.id !== editingDoctor.id)
                                            .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                                            .find((d) => (d.order_position || 0) === (editingDoctor.order_position || 0) - 1);
                                        return prev ? prev.id : 'first';
                                    })()}
                                    onValueChange={(selectedId) => {
                                        if (selectedId === 'first') {
                                            setEditingDoctor((prev) => (prev ? { ...prev, order_position: 1 } : prev));
                                        } else {
                                            const idx = doctors.findIndex((d) => d.id === selectedId);
                                            setEditingDoctor((prev) => (prev ? { ...prev, order_position: (doctors[idx]?.order_position || 0) + 1 } : prev));
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Wybierz pozycję" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="first">Na początku listy</SelectItem>
                                        {doctors
                                            .filter((d) => !editingDoctor.id || d.id !== editingDoctor.id)
                                            .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                                            .map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    Po: Dr. {d.first_name} {d.last_name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="doctorActive" checked={editingDoctor.is_active} onChange={(e) => setEditingDoctor({ ...editingDoctor, is_active: e.target.checked })} />
                                <Label htmlFor="doctorActive">Aktywny</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                </Button>
                                <Button variant="outline" onClick={() => setEditingDoctor(null)} disabled={isSaving}>
                                    Anuluj
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imię i Nazwisko</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specjalizacja</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Godziny przyjęć</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {doctors
                                        .slice()
                                        .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                                        .map((doctor) => (
                                            <tr key={doctor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Dr. {doctor.first_name} {doctor.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                    <div className="truncate max-h-16 overflow-hidden" title={doctor.schedule ? doctor.schedule.replace(/<[^>]*>/g, '') : 'Brak informacji'}>
                                                        {doctor.schedule ? <div dangerouslySetInnerHTML={{ __html: doctor.schedule }} className="prose prose-sm max-w-none" /> : 'Brak informacji'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant={doctor.is_active ? 'default' : 'secondary'}
                                                        className={doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                    >
                                                        {doctor.is_active ? 'Aktywny' : 'Nieaktywny'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => setEditingDoctor(doctor)} title="Edytuj lekarza">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onDelete('doctors', doctor.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Usuń lekarza"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {doctors.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        <h3 className="text-lg font-medium mb-2">Brak lekarzy</h3>
                                        <p className="text-sm">Rozpocznij od dodania pierwszego lekarza.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
