'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { AnimatedSection } from '@/components/ui/animated-section';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Service } from '@/lib/types/services';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ServicesManagementProps {
  services: Service[];
  onSave: (service: Partial<Service>) => Promise<{ success: boolean; error?: string } | void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (
    serviceId: string,
    targetId: string,
    serviceNewPos: number,
    targetNewPos: number
  ) => Promise<{ success: boolean; error?: string }>;
  isSaving?: boolean;
}

export function ServicesManagement({
  services,
  onSave,
  onDelete,
  onReorder,
  isSaving = false,
}: ServicesManagementProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; onConfirm: () => void }>({
    open: false,
    onConfirm: () => {},
  });
  const { toast } = useToast();
  const router = useRouter();

  const sortedServices = [...services].sort(
    (a, b) => (a.order_position || 0) - (b.order_position || 0)
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      try {
        const result = await onSave(editingService);
        if (result && !result.success) {
          toast({
            title: 'Błąd',
            description: result.error || 'Nie udało się zapisać usługi',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Sukces',
          description: editingService.id ? 'Usługa zaktualizowana' : 'Usługa dodana',
          variant: 'success',
        });
        setEditingService(null);
        router.refresh();
      } catch (error: any) {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zapisać usługi',
          variant: 'destructive',
        });
      }
    }
  };

  const handleNewService = () => {
    setEditingService({
      id: '',
      title: '',
      description: '',
      icon: '',
      is_published: true,
      order_position: sortedServices.length + 1,
      created_at: '',
      updated_at: '',
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const current = sortedServices[index]!;
    const prev = sortedServices[index - 1]!;
    const currentPos = current.order_position || index + 1;
    const prevPos = prev.order_position || index;
    const result = await onReorder(current.id, prev.id, prevPos, currentPos);
    if (result?.success) {
      router.refresh();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= sortedServices.length - 1) return;
    const current = sortedServices[index]!;
    const next = sortedServices[index + 1]!;
    const currentPos = current.order_position || index + 1;
    const nextPos = next.order_position || index + 2;
    const result = await onReorder(current.id, next.id, nextPos, currentPos);
    if (result?.success) {
      router.refresh();
    }
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
                <Input
                  id="serviceTitle"
                  value={editingService.title}
                  onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="serviceDescription">Opis</Label>
                <Input
                  id="serviceDescription"
                  value={editingService.description}
                  onChange={e =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  placeholder="Opis usługi"
                />
              </div>
              <div>
                <Label htmlFor="serviceIcon">Ikona</Label>
                <Select
                  value={editingService.icon}
                  onValueChange={value => setEditingService({ ...editingService, icon: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz ikonę dla usługi" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map(icon => (
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
                  onChange={e =>
                    setEditingService({ ...editingService, is_published: e.target.checked })
                  }
                />
                <Label htmlFor="servicePublished">Opublikowana</Label>
              </div>
              <div>
                <Label htmlFor="serviceOrder">Pozycja (kolejność)</Label>
                <Input
                  id="serviceOrder"
                  type="number"
                  min={1}
                  value={editingService.order_position || 1}
                  onChange={e =>
                    setEditingService({
                      ...editingService,
                      order_position: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingService(null)}
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kolejność
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tytuł
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ikona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedServices.map((service, index) => {
                    const iconInfo = availableIcons.find(icon => icon.value === service.icon);
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0 || isSaving}
                              title="Przesuń w górę"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === sortedServices.length - 1 || isSaving}
                              title="Przesuń w dół"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {service.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {iconInfo ? iconInfo.label : service.icon || '❓ Brak ikony'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={service.is_published ? 'default' : 'secondary'}
                            className={
                              service.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {service.is_published ? 'Opublikowana' : 'Szkic'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingService(service)}
                            title="Edytuj usługę"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                onConfirm: async () => {
                                  try {
                                    await onDelete(service.id);
                                    toast({
                                      title: 'Sukces',
                                      description: 'Usługa usunięta',
                                      variant: 'success',
                                    });
                                    router.refresh();
                                  } catch (error: any) {
                                    toast({
                                      title: 'Błąd',
                                      description: error.message || 'Nie udało się usunąć usługi',
                                      variant: 'destructive',
                                    });
                                  }
                                },
                              })
                            }
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
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}
        title="Usuń usługę"
        description="Czy na pewno chcesz usunąć tę usługę? Tej operacji nie można cofnąć."
        onConfirm={confirmDialog.onConfirm}
      />
    </AnimatedSection>
  );
}
