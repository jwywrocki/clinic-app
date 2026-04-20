'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { sanitizeHtml } from '@/lib/html-sanitizer';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Doctor } from '@/lib/types/doctors';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Specialization } from '@/lib/types/specializations';

interface DoctorsManagementProps {
  doctors: Doctor[];
  specializations: Specialization[];
  onSave: (doctor: Partial<Doctor>) => Promise<{ success: boolean; error?: string } | void>;
  onDelete: (id: string) => Promise<void>;
  isSaving?: boolean;
}

export function DoctorsManagement({
  doctors,
  specializations,
  onSave,
  onDelete,
  isSaving = false,
}: DoctorsManagementProps) {
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; onConfirm: () => void }>({
    open: false,
    onConfirm: () => {},
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      try {
        const result = await onSave(editingDoctor);
        if (result && !result.success) {
          toast({
            title: 'Błąd',
            description: result.error || 'Nie udało się zapisać personelu',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Sukces',
          description: editingDoctor.id ? 'Personel zaktualizowany' : 'Personel dodany',
          variant: 'success',
        });
        setEditingDoctor(null);
        router.refresh();
      } catch (error: any) {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zapisać personelu',
          variant: 'destructive',
        });
      }
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
      order_position: 1,
      specialization_ids: [],
      created_at: '',
      updated_at: '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDoctor) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEditingDoctor({ ...editingDoctor, image_url: data.url || data.filePath });
      } else {
        toast({
          title: 'Błąd',
          description: 'Błąd podczas przesyłania obrazu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Błąd',
        description: 'Błąd podczas przesyłania obrazu',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveWithReorder = async (doctor: Partial<Doctor>) => {
    try {
      let newDoctors: Doctor[] = [];
      if (!doctor.id) {
        const tempId = 'temp-' + Math.random();
        newDoctors = [
          ...doctors,
          { ...doctor, id: tempId, order_position: doctor.order_position || 1 } as Doctor,
        ];
      } else {
        newDoctors = doctors.map(d => (d.id === doctor.id ? { ...d, ...doctor } : d));
      }
      newDoctors = newDoctors
        .filter(d => d.id !== doctor.id)
        .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

      const insertAt = (doctor.order_position || 1) - 1;
      newDoctors.splice(insertAt, 0, { ...doctor } as Doctor);

      newDoctors = newDoctors.map((d, idx) => ({ ...d, order_position: idx + 1 }));

      for (const d of newDoctors) {
        if (
          d.id === doctor.id ||
          doctors.find(old => old.id === d.id)?.order_position !== d.order_position
        ) {
          await onSave(d);
        }
      }
      toast({
        title: 'Sukces',
        description: doctor.id ? 'Personel zaktualizowany' : 'Personel dodany',
        variant: 'success',
      });
      setEditingDoctor(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zapisać personelu',
        variant: 'destructive',
      });
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    if (selectedSpecializationId === 'all') return true;
    return (
      doc.specialization_ids?.includes(selectedSpecializationId) ||
      doc.specialization === selectedSpecializationId
    );
  });

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
              onSubmit={e => {
                e.preventDefault();
                if (
                  !editingDoctor.first_name?.trim() ||
                  !editingDoctor.last_name?.trim() ||
                  (editingDoctor.specialization_ids?.length || 0) === 0
                ) {
                  toast({
                    title: 'Uwaga',
                    description: 'Imię, nazwisko i co najmniej 1 specjalizacja są wymagane!',
                    variant: 'destructive',
                  });
                  return;
                }
                handleSaveWithReorder(editingDoctor);
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="doctorName">Imię *</Label>
                <Input
                  id="doctorName"
                  value={editingDoctor.first_name || ''}
                  onChange={e => setEditingDoctor({ ...editingDoctor, first_name: e.target.value })}
                  placeholder="Jan"
                  required
                />
              </div>
              <div>
                <Label htmlFor="doctorSurname">Nazwisko *</Label>
                <Input
                  id="doctorSurname"
                  value={editingDoctor.last_name || ''}
                  onChange={e => setEditingDoctor({ ...editingDoctor, last_name: e.target.value })}
                  placeholder="Kowalski"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="doctorSpecialty">Specjalizacja *</Label>
                  <Link
                    href="/admin/specializations"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Zarządzaj specjalizacjami
                  </Link>
                </div>
                {specializations.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2 p-3 border rounded-md">
                    {specializations.map(item => {
                      const checked = (editingDoctor.specialization_ids || []).includes(item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              const current = new Set(editingDoctor.specialization_ids || []);
                              if (e.target.checked) current.add(item.id);
                              else current.delete(item.id);
                              const ids = Array.from(current);
                              setEditingDoctor({
                                ...editingDoctor,
                                specialization_ids: ids,
                                specialization: ids[0] || '',
                                specialization_name:
                                  specializations.find(s => s.id === ids[0])?.name || '',
                                specialization_names: ids
                                  .map(id => specializations.find(s => s.id === id)?.name || id)
                                  .filter(Boolean),
                              });
                            }}
                          />
                          <span>{item.name}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    id="doctorSpecialty"
                    value={editingDoctor.specialization || ''}
                    onChange={e =>
                      setEditingDoctor({
                        ...editingDoctor,
                        specialization: e.target.value,
                        specialization_ids: e.target.value.trim() ? [e.target.value.trim()] : [],
                      })
                    }
                    placeholder="Wpisz specjalizację (tryb zgodności)"
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="doctorDescription">Opis</Label>
                <Input
                  id="doctorDescription"
                  value={editingDoctor.bio || ''}
                  onChange={e => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  placeholder="Krótki opis lekarza"
                />
              </div>
              <div>
                <Label>Zdjęcie</Label>
                <div className="flex items-center gap-4">
                  <Input
                    value={editingDoctor.image_url || ''}
                    onChange={e =>
                      setEditingDoctor({ ...editingDoctor, image_url: e.target.value })
                    }
                    placeholder="URL zdjęcia lub prześlij z dysku"
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Przesyłanie...' : 'Prześlij'}
                  </Button>
                </div>
                {editingDoctor.image_url && (
                  <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={editingDoctor.image_url}
                      alt="Podgląd"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="doctorSchedule">Godziny przyjęć</Label>
                <RichTextEditor
                  value={editingDoctor.schedule || ''}
                  onChange={value => setEditingDoctor({ ...editingDoctor, schedule: value })}
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
                      .filter(d => d.id !== editingDoctor.id)
                      .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                      .find(
                        d => (d.order_position || 0) === (editingDoctor.order_position || 0) - 1
                      );
                    return prev ? prev.id : 'first';
                  })()}
                  onValueChange={selectedId => {
                    if (selectedId === 'first') {
                      setEditingDoctor(prev => (prev ? { ...prev, order_position: 1 } : prev));
                    } else {
                      const idx = doctors.findIndex(d => d.id === selectedId);
                      setEditingDoctor(prev =>
                        prev
                          ? { ...prev, order_position: (doctors[idx]?.order_position || 0) + 1 }
                          : prev
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz pozycję" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">Na początku listy</SelectItem>
                    {doctors
                      .filter(d => !editingDoctor.id || d.id !== editingDoctor.id)
                      .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                      .map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          Po: {d.first_name} {d.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="doctorActive"
                  checked={editingDoctor.is_active}
                  onChange={e =>
                    setEditingDoctor({ ...editingDoctor, is_active: e.target.checked })
                  }
                />
                <Label htmlFor="doctorActive">Aktywny</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingDoctor(null)}
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="text-sm text-gray-500">
                  Liczba lekarzy: {filteredDoctors.length}
                </div>
                <div className="w-full md:w-72">
                  <Select
                    value={selectedSpecializationId}
                    onValueChange={setSelectedSpecializationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wszystkie specjalizacje" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie specjalizacje</SelectItem>
                      {specializations.map(spec => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Imię i Nazwisko
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specjalizacja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Godziny przyjęć
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
                    {filteredDoctors
                      .slice()
                      .sort((a, b) => (a.order_position || 0) - (b.order_position || 0))
                      .map(doctor => (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doctor.first_name} {doctor.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.specialization_names?.join(', ') ||
                              doctor.specialization_name ||
                              doctor.specialization}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="truncate max-h-16 overflow-hidden">
                              {doctor.schedule ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(doctor.schedule),
                                  }}
                                  className="prose prose-sm max-w-none"
                                />
                              ) : (
                                'Brak informacji'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={doctor.is_active ? 'default' : 'secondary'}
                              className={
                                doctor.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {doctor.is_active ? 'Aktywny' : 'Nieaktywny'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDoctor(doctor)}
                              title="Edytuj lekarza"
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
                                      await onDelete(doctor.id);
                                      toast({
                                        title: 'Sukces',
                                        description: 'Personel usunięty',
                                        variant: 'success',
                                      });
                                      router.refresh();
                                    } catch (error: any) {
                                      toast({
                                        title: 'Błąd',
                                        description:
                                          error.message || 'Nie udało się usunąć personelu',
                                        variant: 'destructive',
                                      });
                                    }
                                  },
                                })
                              }
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
                {filteredDoctors.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      <h3 className="text-lg font-medium mb-2">Brak lekarzy</h3>
                      <p className="text-sm">Rozpocznij od dodania pierwszego lekarza.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}
        title="Usuń personel"
        description="Czy na pewno chcesz usunąć ten personel? Tej operacji nie można cofnąć."
        onConfirm={confirmDialog.onConfirm}
      />
    </AnimatedSection>
  );
}
