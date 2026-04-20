'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedSection } from '@/components/ui/animated-section';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Specialization } from '@/lib/types/specializations';

interface SpecializationsManagementProps {
  specializations: Specialization[];
  onSave: (data: Partial<Specialization>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function SpecializationsManagement({
  specializations,
  onSave,
  onDelete,
}: SpecializationsManagementProps) {
  const [editing, setEditing] = useState<Specialization | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; onConfirm: () => void }>({
    open: false,
    onConfirm: () => {},
  });

  const sorted = [...specializations].sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const result = await onSave(editing);
    if (!result.success) {
      toast({
        title: 'Błąd',
        description: result.error || 'Nie udało się zapisać specjalizacji',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sukces',
      description: editing.id ? 'Specjalizacja zaktualizowana' : 'Specjalizacja dodana',
      variant: 'success',
    });
    setEditing(null);
    router.refresh();
  };

  return (
    <AnimatedSection animation="fadeInUp">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Specjalizacje lekarzy</CardTitle>
            <Button
              onClick={() =>
                setEditing({
                  id: '',
                  name: '',
                  description: '',
                  created_at: '',
                  updated_at: '',
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj specjalizację
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="specName">Nazwa specjalizacji *</Label>
                <Input
                  id="specName"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  placeholder="np. Kardiologia"
                  required
                />
              </div>
              <div>
                <Label htmlFor="specDescription">Opis (opcjonalnie)</Label>
                <Input
                  id="specDescription"
                  value={editing.description || ''}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Krótki opis specjalizacji"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Zapisz</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
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
                      Nazwa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sorted.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.description || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditing(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              onConfirm: async () => {
                                const result = await onDelete(item.id);
                                if (!result.success) {
                                  toast({
                                    title: 'Błąd',
                                    description: result.error || 'Nie udało się usunąć',
                                    variant: 'destructive',
                                  });
                                  return;
                                }
                                toast({
                                  title: 'Sukces',
                                  description: 'Usunięto specjalizację',
                                  variant: 'success',
                                });
                                router.refresh();
                              },
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sorted.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Brak specjalizacji. Dodaj pierwszą.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}
        title="Usuń specjalizację"
        description="Czy na pewno chcesz usunąć tę specjalizację? Tej operacji nie można cofnąć."
        onConfirm={confirmDialog.onConfirm}
      />
    </AnimatedSection>
  );
}
