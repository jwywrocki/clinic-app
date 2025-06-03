'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Doctor } from '../types';

interface DoctorsManagementProps {
    doctors: Doctor[];
    onSave: (doctor: Partial<Doctor>) => void;
    onDelete: (table: string, id: string) => Promise<void>;
}

export function DoctorsManagement({ doctors, onSave, onDelete }: DoctorsManagementProps) {
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
            description: '',
            image_url: '',
            is_active: true,
            order_position: 0,
            created_at: '',
            updated_at: '',
        });
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzaj Lekarzami</CardTitle>
                        <Button onClick={handleNewDoctor}>Dodaj Lekarza</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingDoctor ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    value={editingDoctor.description || ''}
                                    onChange={(e) => setEditingDoctor({ ...editingDoctor, description: e.target.value })}
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
                                <Label htmlFor="doctorOrder">Pozycja</Label>
                                <Input
                                    id="doctorOrder"
                                    type="number"
                                    value={editingDoctor.order_position || 0}
                                    onChange={(e) => setEditingDoctor({ ...editingDoctor, order_position: Number.parseInt(e.target.value) || 0 })}
                                    placeholder="Kolejność wyświetlania"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="doctorActive" checked={editingDoctor.is_active} onChange={(e) => setEditingDoctor({ ...editingDoctor, is_active: e.target.checked })} />
                                <Label htmlFor="doctorActive">Aktywny</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Zapisz</Button>
                                <Button variant="outline" onClick={() => setEditingDoctor(null)}>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {doctors.map((doctor) => (
                                        <tr key={doctor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`Dr. ${doctor.first_name} ${doctor.last_name}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={doctor.is_active ? 'default' : 'secondary'} className={doctor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                    {doctor.is_active ? 'Aktywny' : 'Nieaktywny'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => setEditingDoctor(doctor)}>
                                                    Edytuj
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => onDelete('doctors', doctor.id)}>
                                                    Usuń
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {doctors.length === 0 && <p className="text-center text-gray-500 py-4">Brak lekarzy.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
