'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Page } from '@/lib/types/pages';
import { Survey } from '@/lib/types/surveys';
import { Specialization } from '@/lib/types/specializations';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface PagesManagementProps {
  pages: Page[];
  specializations: Specialization[];
  onSave: (page: Partial<Page>) => Promise<{ success: boolean; error?: string } | void>;
  onDelete: (id: string) => Promise<void>;
  isSaving?: boolean;
}

export function PagesManagement({
  pages,
  specializations,
  onSave,
  onDelete,
  isSaving = false,
}: PagesManagementProps) {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; onConfirm: () => void }>({
    open: false,
    onConfirm: () => {},
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      try {
        const result = await onSave(editingPage);
        if (result && !result.success) {
          toast({
            title: 'Błąd',
            description: result.error || 'Nie udało się zapisać strony',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Sukces',
          description: editingPage.id ? 'Strona zaktualizowana' : 'Strona dodana',
          variant: 'success',
        });
        setEditingPage(null);
        router.refresh();
      } catch (error: any) {
        toast({
          title: 'Błąd',
          description: error.message || 'Nie udało się zapisać strony',
          variant: 'destructive',
        });
      }
    }
  };

  const handleNewPage = () => {
    setEditingPage({
      id: '',
      title: '',
      slug: '',
      content: '',
      is_published: false,
      survey_id: undefined,
      specialization_ids: [],
      created_at: '',
      updated_at: '',
    });
  };

  return (
    <AnimatedSection animation="fadeInUp">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Zarządzaj Stronami</CardTitle>
            <Button onClick={handleNewPage}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nową stronę
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editingPage ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pageTitle">Tytuł</Label>
                <Input
                  id="pageTitle"
                  value={editingPage.title}
                  onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pageSlug">Slug (URL)</Label>
                <Input
                  id="pageSlug"
                  value={editingPage.slug}
                  onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pageContent">Treść</Label>
                <RichTextEditor
                  value={editingPage.content}
                  onChange={value => setEditingPage({ ...editingPage, content: value })}
                />
              </div>
              <div>
                <Label htmlFor="pageMetaDescription">Meta Opis (SEO)</Label>
                <Input
                  id="pageMetaDescription"
                  value={editingPage.meta_description || ''}
                  onChange={e =>
                    setEditingPage({ ...editingPage, meta_description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="pageSurvey">Ankieta na stronie</Label>
                <select
                  id="pageSurvey"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={editingPage.survey_id || ''}
                  onChange={e =>
                    setEditingPage({ ...editingPage, survey_id: e.target.value || undefined })
                  }
                >
                  <option value="">Brak ankiety</option>
                  {surveys
                    .filter(s => s.is_published)
                    .map(survey => (
                      <option key={survey.id} value={survey.id}>
                        {survey.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label>Specjalizacje personelu do wyświetlenia (widok kart)</Label>
                <div className="mt-2 grid md:grid-cols-2 gap-2 p-3 border rounded-md">
                  {specializations.length === 0 && (
                    <p className="text-sm text-gray-500">Brak zdefiniowanych specjalizacji.</p>
                  )}
                  {specializations.map(spec => {
                    const checked = (editingPage.specialization_ids || []).includes(spec.id);
                    return (
                      <label key={spec.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const current = new Set(editingPage.specialization_ids || []);
                            if (e.target.checked) current.add(spec.id);
                            else current.delete(spec.id);
                            setEditingPage({
                              ...editingPage,
                              specialization_ids: Array.from(current),
                            });
                          }}
                        />
                        <span>{spec.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Jeśli nic nie wybierzesz, strona nie pokaże sekcji lekarzy.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pagePublished"
                  checked={editingPage.is_published}
                  onChange={e => setEditingPage({ ...editingPage, is_published: e.target.checked })}
                />
                <Label htmlFor="pagePublished">Opublikowana</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
                <Button variant="outline" onClick={() => setEditingPage(null)} disabled={isSaving}>
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
                      Tytuł
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
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
                  {pages.map(page => {
                    return (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {page.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          /{page.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={page.is_published ? 'default' : 'secondary'}
                            className={
                              page.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {page.is_published ? 'Opublikowana' : 'Szkic'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPage(page)}
                            title="Edytuj stronę"
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
                                    await onDelete(page.id);
                                    toast({
                                      title: 'Sukces',
                                      description: 'Strona usunięta',
                                      variant: 'success',
                                    });
                                    router.refresh();
                                  } catch (error: any) {
                                    toast({
                                      title: 'Błąd',
                                      description: error.message || 'Nie udało się usunąć strony',
                                      variant: 'destructive',
                                    });
                                  }
                                },
                              })
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Usuń stronę"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {pages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Brak stron</h3>
                    <p className="text-sm">Rozpocznij od dodania pierwszej strony.</p>
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
        title="Usuń stronę"
        description="Czy na pewno chcesz usunąć tę stronę? Tej operacji nie można cofnąć."
        onConfirm={confirmDialog.onConfirm}
      />
    </AnimatedSection>
  );
}
