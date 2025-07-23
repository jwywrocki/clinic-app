'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Service } from '@/lib/types/services';

interface ServicesManagementProps {
    services: Service[];
    onSave: (service: Partial<Service>) => void;
    onDelete: (table: string, id: string) => Promise<void>;
    isSaving?: boolean;
}

export function ServicesManagement({ services, onSave, onDelete, isSaving = false }: ServicesManagementProps) {
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Dostępne ikony dla usług medycznych
    const availableIcons = [
        { value: 'heart', label: '❤️ Heart (Kardiologia)' },
        { value: 'stethoscope', label: '🩺 Stethoscope (Medycyna ogólna)' },
        { value: 'pill', label: '💊 Pill (Farmacja)' },
        { value: 'syringe', label: '💉 Syringe (Szczepienia)' },
        { value: 'bandage', label: '🩹 Bandage (Chirurgia)' },
        { value: 'tooth', label: '🦷 Tooth (Stomatologia)' },
        { value: 'eye', label: '👁️ Eye (Okulistyka)' },
        { value: 'brain', label: '🧠 Brain (Neurologia)' },
        { value: 'lungs', label: '🫁 Lungs (Pulmonologia)' },
        { value: 'bone', label: '🦴 Bone (Ortopedia)' },
        { value: 'microscope', label: '🔬 Microscope (Laboratorium)' },
        { value: 'x-ray', label: '🩻 X-ray (Radiologia)' },
        { value: 'thermometer', label: '🌡️ Thermometer (Diagnostyka)' },
        { value: 'baby', label: '👶 Baby (Pediatria)' },
        { value: 'pregnant-woman', label: '🤰 Pregnant Woman (Ginekologia)' },
        { value: 'elderly', label: '👴 Elderly (Geriatria)' },
        { value: 'wheelchair', label: '♿ Wheelchair (Rehabilitacja)' },
        { value: 'ambulance', label: '🚑 Ambulance (Pogotowie)' },
        { value: 'hospital', label: '🏥 Hospital (Szpital)' },
        { value: 'first-aid', label: '🆘 First Aid (Pierwsza pomoc)' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingService) {
            onSave(editingService);
            setEditingService(null);
        }
    };

    const handleNewService = () => {
        setEditingService({
            id: '',
            title: '',
            description: '',
            icon: '',
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
                        <CardTitle>Zarządzaj Usługami</CardTitle>
                        <Button onClick={handleNewService}>
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj nową usługę
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingService ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="serviceTitle">Tytuł</Label>
                                <Input id="serviceTitle" value={editingService.title} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} required />
                            </div>
                            <div>
                                <Label htmlFor="serviceDescription">Opis</Label>
                                <Input
                                    id="serviceDescription"
                                    value={editingService.description}
                                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                    placeholder="Opis usługi"
                                />
                            </div>
                            <div>
                                <Label htmlFor="serviceIcon">Ikona</Label>
                                <Select value={editingService.icon} onValueChange={(value) => setEditingService({ ...editingService, icon: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Wybierz ikonę dla usługi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableIcons.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="servicePublished"
                                    checked={editingService.is_published || false}
                                    onChange={(e) => setEditingService({ ...editingService, is_published: e.target.checked })}
                                />
                                <Label htmlFor="servicePublished">Opublikowana</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                </Button>
                                <Button variant="outline" onClick={() => setEditingService(null)} disabled={isSaving}>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ikona</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {services.map((service) => {
                                        const iconInfo = availableIcons.find((icon) => icon.value === service.icon);
                                        return (
                                            <tr key={service.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{service.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{iconInfo ? iconInfo.label : service.icon || '❓ Brak ikony'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant={service.is_published ? 'default' : 'secondary'}
                                                        className={service.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                    >
                                                        {service.is_published ? 'Opublikowana' : 'Szkic'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => setEditingService(service)} title="Edytuj usługę">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onDelete('services', service.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Usuń usługę"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {services.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        <h3 className="text-lg font-medium mb-2">Brak usług</h3>
                                        <p className="text-sm">Rozpocznij od dodania pierwszej usługi.</p>
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
