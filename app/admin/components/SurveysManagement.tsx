'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnimatedSection } from '@/components/ui/animated-section';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Download, GripVertical, Save, X } from 'lucide-react';
import { Survey, Question, QuestionOption, SurveyData, QuestionData, QuestionOptionData } from '@/lib/types/surveys';

interface SurveysManagementProps {
    onSave: (data: any) => Promise<void>;
    currentUser?: { id: string } | null;
    isSaving?: boolean;
}

export function SurveysManagement({ onSave, currentUser, isSaving = false }: SurveysManagementProps) {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [newQuestion, setNewQuestion] = useState<Partial<QuestionData>>({
        text: '',
        type: 'single',
        order_no: 0,
    });
    const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', '']);

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/surveys');
            if (response.ok) {
                const data = await response.json();
                setSurveys(data);
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się pobrać ankiet.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSurveyDetails = async (surveyId: string) => {
        try {
            const response = await fetch(`/api/surveys?id=${surveyId}`);
            if (response.ok) {
                const survey = await response.json();
                setSelectedSurvey(survey);
                return survey;
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się pobrać szczegółów ankiety.',
                variant: 'destructive',
            });
        }
        return null;
    };

    const handleCreateSurvey = async () => {
        const surveyData: SurveyData = {
            title: 'Dodaj ankietę',
            is_published: false,
            created_by: currentUser?.id || null,
        };

        try {
            const response = await fetch('/api/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData),
            });

            if (response.ok) {
                const newSurvey = await response.json();
                setSurveys((prev) => [newSurvey, ...prev]);
                await fetchSurveyDetails(newSurvey.id);
                setIsEditDialogOpen(true);
                toast({
                    title: 'Sukces',
                    description: 'Ankieta została utworzona.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się utworzyć ankiety.',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateSurvey = async (surveyId: string, updates: Partial<SurveyData>) => {
        try {
            const response = await fetch(`/api/surveys?id=${surveyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedSurvey = await response.json();
                setSurveys((prev) => prev.map((s) => (s.id === surveyId ? updatedSurvey : s)));
                if (selectedSurvey?.id === surveyId) {
                    setSelectedSurvey((prev) => ({ ...prev!, ...updatedSurvey }));
                }
                toast({
                    title: 'Sukces',
                    description: 'Ankieta została zaktualizowana.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się zaktualizować ankiety.',
                variant: 'destructive',
            });
        }
    };

    const handleSaveFullSurvey = async (survey: Survey) => {
        try {
            // Use the onSave function from AdminPanel which handles loading state
            await onSave({
                id: survey.id,
                title: survey.title,
                is_published: survey.is_published,
            });

            // Save question options after main survey is saved
            if (survey.questions) {
                const optionPromises = survey.questions.flatMap(
                    (question) =>
                        question.options?.map((option) =>
                            fetch(`/api/surveys/${survey.id}/questions/dummy/options/${option.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: option.text }),
                            })
                        ) || []
                );

                await Promise.all(optionPromises);
            }

            setSurveys((prev) => prev.map((s) => (s.id === survey.id ? { ...s, ...survey } : s)));

            // Refresh survey details to get latest data
            await fetchSurveyDetails(survey.id);
        } catch (error) {
            console.error('Error saving survey:', error);
        }
    };

    const handleDeleteSurvey = async (surveyId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć tę ankietę?')) return;

        try {
            const response = await fetch(`/api/surveys?id=${surveyId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
                toast({
                    title: 'Sukces',
                    description: 'Ankieta została usunięta.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się usunąć ankiety.',
                variant: 'destructive',
            });
        }
    };

    const handleAddQuestion = async () => {
        if (!selectedSurvey || !newQuestion.text) return;

        const questionData: QuestionData = {
            text: newQuestion.text,
            type: newQuestion.type as 'single' | 'multi' | 'text',
            order_no: selectedSurvey.questions?.length || 0,
            survey_id: selectedSurvey.id,
        };

        try {
            const response = await fetch(`/api/surveys/${selectedSurvey.id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionData),
            });

            if (response.ok) {
                const newQuestionResult = await response.json();

                if ((newQuestion.type === 'single' || newQuestion.type === 'multi') && newQuestionOptions.length > 0) {
                    const validOptions = newQuestionOptions.filter((opt) => opt.trim() !== '');

                    for (let i = 0; i < validOptions.length; i++) {
                        const optionData: QuestionOptionData = {
                            text: validOptions[i],
                            order_no: i,
                            question_id: newQuestionResult.id,
                        };

                        await fetch(`/api/surveys/${selectedSurvey.id}/questions/${newQuestionResult.id}/options`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(optionData),
                        });
                    }

                    await fetchSurveyDetails(selectedSurvey.id);
                } else {
                    setSelectedSurvey((prev) => ({
                        ...prev!,
                        questions: [...(prev!.questions || []), newQuestionResult],
                    }));
                }

                setNewQuestion({ text: '', type: 'single', order_no: 0 });
                setNewQuestionOptions(['', '']);
                toast({
                    title: 'Sukces',
                    description: 'Pytanie zostało dodane.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się dodać pytania.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!selectedSurvey || !confirm('Czy na pewno chcesz usunąć to pytanie?')) return;

        try {
            const response = await fetch(`/api/surveys/${selectedSurvey.id}/questions/${questionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSelectedSurvey((prev) => ({
                    ...prev!,
                    questions: prev!.questions?.filter((q) => q.id !== questionId) || [],
                }));
                toast({
                    title: 'Sukces',
                    description: 'Pytanie zostało usunięte.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się usunąć pytania.',
                variant: 'destructive',
            });
        }
    };

    const handleAddOptionToNewQuestion = () => {
        setNewQuestionOptions((prev) => [...prev, '']);
    };

    const handleUpdateNewQuestionOption = (index: number, value: string) => {
        setNewQuestionOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
    };

    const handleRemoveNewQuestionOption = (index: number) => {
        if (newQuestionOptions.length > 1) {
            setNewQuestionOptions((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleAddOptionToExistingQuestion = async (questionId: string) => {
        if (!selectedSurvey) return;

        const optionData: QuestionOptionData = {
            text: 'Nowa opcja',
            order_no: 0,
            question_id: questionId,
        };

        try {
            const response = await fetch(`/api/surveys/${selectedSurvey.id}/questions/${questionId}/options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(optionData),
            });

            if (response.ok) {
                await fetchSurveyDetails(selectedSurvey.id);
                toast({
                    title: 'Sukces',
                    description: 'Opcja została dodana.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się dodać opcji.',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateQuestionOption = (optionId: string, newText: string) => {
        if (!selectedSurvey) return;

        // Update only local state, save will happen when user clicks "Save Survey"
        setSelectedSurvey((prev) => {
            if (!prev) return prev;

            const updatedQuestions = prev.questions?.map((question) => ({
                ...question,
                options: question.options?.map((option) => (option.id === optionId ? { ...option, text: newText } : option)),
            }));

            return {
                ...prev,
                questions: updatedQuestions,
            };
        });
    };

    const handleDeleteQuestionOption = async (optionId: string) => {
        if (!selectedSurvey || !confirm('Czy na pewno chcesz usunąć tę opcję?')) return;

        try {
            const response = await fetch(`/api/surveys/${selectedSurvey.id}/questions/dummy/options/${optionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchSurveyDetails(selectedSurvey.id);
                toast({
                    title: 'Sukces',
                    description: 'Opcja została usunięta.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się usunąć opcji.',
                variant: 'destructive',
            });
        }
    };

    const handleExportCSV = async (surveyId: string) => {
        try {
            const response = await fetch(`/api/surveys?exportSurveyId=${surveyId}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `survey_${surveyId}_export.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast({
                    title: 'Sukces',
                    description: 'Eksport CSV został pobrany.',
                    variant: 'success',
                });
            }
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie udało się wyeksportować danych.',
                variant: 'destructive',
            });
        }
    };

    const renderQuestionForm = (question: Question | null, isNew: boolean = false) => {
        const currentQuestion = isNew ? newQuestion : question;
        if (!currentQuestion) return null;

        const showOptions = currentQuestion.type === 'single' || currentQuestion.type === 'multi';
        const options = isNew ? newQuestionOptions : question?.options || [];

        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="questionText">Treść pytania</Label>
                    <Input
                        id="questionText"
                        value={currentQuestion.text || ''}
                        onChange={(e) => {
                            if (isNew) {
                                setNewQuestion((prev) => ({ ...prev, text: e.target.value }));
                            } else {
                                setEditingQuestion((prev) => ({ ...prev!, text: e.target.value }));
                            }
                        }}
                        placeholder="Wprowadź treść pytania"
                    />
                </div>
                <div>
                    <Label htmlFor="questionType">Typ pytania</Label>
                    <select
                        id="questionType"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={currentQuestion.type || 'single'}
                        onChange={(e) => {
                            const value = e.target.value as 'single' | 'multi' | 'text';
                            if (isNew) {
                                setNewQuestion((prev) => ({ ...prev, type: value }));
                                if (value === 'text') {
                                    setNewQuestionOptions(['']);
                                } else if (newQuestionOptions.length === 1 && newQuestionOptions[0] === '') {
                                    setNewQuestionOptions(['', '']);
                                }
                            } else {
                                setEditingQuestion((prev) => ({ ...prev!, type: value }));
                            }
                        }}
                    >
                        <option value="single">Pojedynczy wybór</option>
                        <option value="multi">Wielokrotny wybór</option>
                        <option value="text">Pole tekstowe</option>
                    </select>
                </div>

                {showOptions && (
                    <div className="space-y-2">
                        <Label>Opcje odpowiedzi</Label>
                        {isNew ? (
                            <div className="space-y-2">
                                {newQuestionOptions.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input value={option} onChange={(e) => handleUpdateNewQuestionOption(index, e.target.value)} placeholder={`Opcja ${index + 1}`} />
                                        {newQuestionOptions.length > 1 && (
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveNewQuestionOption(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={handleAddOptionToNewQuestion}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Dodaj opcję
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(options as QuestionOption[]).map((option, index) => (
                                    <div key={option.id || index} className="flex items-center gap-2">
                                        <Input value={option.text || ''} onChange={(e) => handleUpdateQuestionOption(option.id, e.target.value)} placeholder={`Opcja ${index + 1}`} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteQuestionOption(option.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddOptionToExistingQuestion(question!.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Dodaj opcję
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-gray-900">Zarządzanie ankietami</CardTitle>
                        <Button onClick={handleCreateSurvey} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj ankietę
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł ankiety</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data utworzenia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ostatnia aktualizacja</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {surveys.map((survey) => (
                                    <tr key={survey.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    survey.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {survey.is_published ? 'Opublikowana' : 'Szkic'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(survey.created_at).toLocaleDateString('pl-PL')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{survey.updated_at ? new Date(survey.updated_at).toLocaleDateString('pl-PL') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        await fetchSurveyDetails(survey.id);
                                                        setIsViewDialogOpen(true);
                                                    }}
                                                    title="Podgląd ankiety"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        await fetchSurveyDetails(survey.id);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                    title="Edytuj ankietę"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExportCSV(survey.id)} title="Eksportuj wyniki">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteSurvey(survey.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Usuń ankietę"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {surveys.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Brak ankiet</h3>
                                    <p className="text-sm">Rozpocznij od utworzenia pierwszej ankiety.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Edit Survey Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edycja ankiety</DialogTitle>
                            </DialogHeader>
                            {selectedSurvey && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="surveyTitle">Tytuł ankiety</Label>
                                            <Input
                                                id="surveyTitle"
                                                value={selectedSurvey.title}
                                                onChange={(e) => {
                                                    setSelectedSurvey((prev) => ({ ...prev!, title: e.target.value }));
                                                }}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="surveyStatus">Status publikacji</Label>
                                            <select
                                                id="surveyStatus"
                                                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={selectedSurvey.is_published ? 'published' : 'draft'}
                                                onChange={(e) => {
                                                    const isPublished = e.target.value === 'published';
                                                    setSelectedSurvey((prev) => ({ ...prev!, is_published: isPublished }));
                                                }}
                                            >
                                                <option value="draft">Szkic</option>
                                                <option value="published">Opublikowana</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pb-4 border-b">
                                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                                            Anuluj
                                        </Button>
                                        <Button onClick={() => handleSaveFullSurvey(selectedSurvey)} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isSaving ? 'Zapisywanie...' : 'Zapisz ankietę'}
                                        </Button>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-4">Pytania</h4>
                                        <div className="space-y-4">
                                            {selectedSurvey.questions?.map((question, index) => (
                                                <Card key={question.id} className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                                                <span className="text-sm font-medium">Pytanie {index + 1}</span>
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                    {question.type === 'single' && 'Pojedynczy wybór'}
                                                                    {question.type === 'multi' && 'Wielokrotny wybór'}
                                                                    {question.type === 'text' && 'Tekst'}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 mb-2">{question.text}</p>
                                                            {question.options && question.options.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-sm text-gray-500">Opcje:</p>
                                                                    <div className="space-y-1">
                                                                        {question.options.map((option, optIndex) => (
                                                                            <div key={option.id} className="flex items-center gap-2 text-sm">
                                                                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                                                                    {optIndex + 1}
                                                                                </span>
                                                                                <Input
                                                                                    value={option.text}
                                                                                    onChange={(e) => handleUpdateQuestionOption(option.id, e.target.value)}
                                                                                    className="text-sm"
                                                                                />
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => handleDeleteQuestionOption(option.id)}
                                                                                    className="text-red-600 hover:text-red-700"
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {(question.type === 'single' || question.type === 'multi') && (
                                                                        <Button variant="outline" size="sm" onClick={() => handleAddOptionToExistingQuestion(question.id)} className="mt-2">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Dodaj opcję
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {(question.type === 'single' || question.type === 'multi') && (!question.options || question.options.length === 0) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleAddOptionToExistingQuestion(question.id)} className="mt-2">
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Dodaj pierwszą opcję
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(question.id)} className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}

                                            {/* Add New Question Form */}
                                            <Card className="p-4 border-dashed">
                                                <h5 className="font-medium mb-4">Dodaj nowe pytanie</h5>
                                                {renderQuestionForm(null, true)}
                                                <Button
                                                    onClick={handleAddQuestion}
                                                    className="mt-4"
                                                    disabled={
                                                        !newQuestion.text ||
                                                        ((newQuestion.type === 'single' || newQuestion.type === 'multi') && newQuestionOptions.filter((opt) => opt.trim() !== '').length < 2)
                                                    }
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Dodaj pytanie
                                                </Button>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* View Survey Dialog */}
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Podgląd ankiety</DialogTitle>
                            </DialogHeader>
                            {selectedSurvey && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">{selectedSurvey.title}</h3>
                                    {selectedSurvey.questions?.map((question, index) => (
                                        <div key={question.id} className="p-4 border rounded-lg">
                                            <p className="font-medium mb-2">
                                                {index + 1}. {question.text}
                                            </p>
                                            {question.type === 'text' && <Input disabled placeholder="Pole tekstowe" />}
                                            {(question.type === 'single' || question.type === 'multi') && (
                                                <div className="space-y-2">
                                                    {question.options?.map((option) => (
                                                        <label key={option.id} className="flex items-center gap-2">
                                                            <input type={question.type === 'single' ? 'radio' : 'checkbox'} disabled name={`question_${question.id}`} />
                                                            <span>{option.text}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
