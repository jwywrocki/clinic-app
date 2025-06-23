'use client';

import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SurveySkeleton } from '@/components/ui/survey-skeleton';
import { useToast } from '@/hooks/use-toast';
import { Survey, Question, SurveySubmission, SurveySubmissionAnswer } from '@/lib/types/surveys';
import { CheckCircle } from 'lucide-react';

interface SurveyWidgetProps {
    surveyId: string;
    preloadedSurvey?: Survey | null;
}

function SurveyWidgetComponent({ surveyId, preloadedSurvey }: SurveyWidgetProps) {
    const [survey, setSurvey] = useState<Survey | null>(preloadedSurvey || null);
    const [answers, setAnswers] = useState<Record<string, SurveySubmissionAnswer>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!preloadedSurvey) {
            fetchSurvey();
        }
    }, [surveyId, preloadedSurvey]);

    const fetchSurvey = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/public/surveys/${surveyId}`, {
                next: { revalidate: 300 }, // Cache for 5 minutes
            });
            if (response.ok) {
                const surveyData = await response.json();
                setSurvey(surveyData);
            } else if (response.status === 404) {
                setSurvey(null);
            }
        } catch (error) {
            console.error('Failed to fetch survey:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, answer: Partial<SurveySubmissionAnswer>) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                question_id: questionId,
                ...answer,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!survey) return;

        // Sprawdź wymagane pytania (single i multi są wymagane, text są opcjonalne)
        const requiredQuestions = survey.questions?.filter((q) => q.type === 'single' || q.type === 'multi') || [];
        const missingAnswers = requiredQuestions.filter((q) => {
            const answer = answers[q.id];
            if (!answer) return true;

            // Dla pytań single/multi sprawdź czy wybrano opcję
            return !answer.option_id && (!answer.answer_text || answer.answer_text.trim() === '');
        });

        if (missingAnswers.length > 0) {
            // Pokaż bardziej szczegółowy komunikat błędu
            const missingQuestionNumbers = missingAnswers.map((q) => {
                const questionIndex = survey.questions?.findIndex((sq) => sq.id === q.id) || 0;
                return `${questionIndex + 1}`;
            });

            toast({
                title: 'Nie wszystkie wymagane pola zostały wypełnione',
                description: `Proszę odpowiedzieć na pytania nr: ${missingQuestionNumbers.join(', ')}. Przewiń w górę aby zobaczyć niewypełnione pola.`,
                variant: 'destructive',
                duration: 8000, // Dłużej wyświetlaj komunikat
            });

            // Przewiń do pierwszego niewypełnionego pytania
            const firstMissingQuestion = missingAnswers[0];
            const questionElement = document.querySelector(`[data-question-id="${firstMissingQuestion.id}"]`);
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Dodaj czerwoną ramkę dla lepszej widoczności
                questionElement.classList.add('ring-2', 'ring-red-500', 'ring-opacity-50');
                setTimeout(() => {
                    questionElement.classList.remove('ring-2', 'ring-red-500', 'ring-opacity-50');
                }, 3000);
            }

            return;
        }

        const submission: SurveySubmission = {
            survey_id: survey.id,
            answers: Object.values(answers),
        };

        try {
            setLoading(true);

            const response = await fetch('/api/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission),
            });

            if (response.ok) {
                const result = await response.json();
                setSubmitted(true);
                toast({
                    title: 'Sukces',
                    description: 'Dziękujemy za wypełnienie ankiety!',
                });
            } else {
                const errorData = await response.json().catch(() => ({
                    error: 'Nieznany błąd',
                    details: 'Wystąpił problem z połączeniem',
                }));

                toast({
                    title: 'Nie udało się wysłać ankiety',
                    description: errorData.details || errorData.error || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
                    variant: 'destructive',
                    duration: 8000,
                });
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
            toast({
                title: 'Problemy z połączeniem',
                description: 'Sprawdź połączenie internetowe i spróbuj ponownie za chwilę.',
                variant: 'destructive',
                duration: 8000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !survey) {
        return (
            <AnimatedSection animation="fadeIn">
                <SurveySkeleton />
            </AnimatedSection>
        );
    }

    if (preloadedSurvey === null) {
        return null;
    }

    if (!survey) {
        return null;
    }

    if (submitted) {
        return (
            <AnimatedSection animation="fadeIn">
                <Card className="p-8 text-center bg-green-50 border-green-200">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Dziękujemy za wypełnienie ankiety!</h3>
                    <p className="text-green-700">Twoja odpowiedź została zapisana. Bardzo dziękujemy za Twój czas i opinię.</p>
                </Card>
            </AnimatedSection>
        );
    }

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">{survey.title}</h3>
                    <p className="text-blue-700 mb-3">Prosimy o wypełnienie poniższej ankiety. Twoja opinia jest dla nas bardzo ważna.</p>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                        <p className="flex items-center gap-2">
                            <span className="text-red-500">*</span>
                            <span>Pola oznaczone gwiazdką są wymagane</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {survey.questions?.map((question, index) => {
                        const isRequired = question.type === 'single' || question.type === 'multi';
                        const hasError = isRequired && !answers[question.id];

                        return (
                            <div
                                key={question.id}
                                data-question-id={question.id}
                                className={`bg-white p-4 rounded-lg border transition-all duration-300 ${hasError ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                            >
                                <Label className="text-base font-medium text-gray-900 mb-3 block">
                                    {index + 1}. {question.text}
                                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                                    {isRequired && <span className="text-sm text-gray-500 ml-2 font-normal">(wymagane)</span>}
                                </Label>

                                {question.type === 'text' && (
                                    <Input
                                        placeholder="Wprowadź swoją odpowiedź..."
                                        value={answers[question.id]?.answer_text || ''}
                                        onChange={(e) =>
                                            handleAnswerChange(question.id, {
                                                answer_text: e.target.value,
                                                option_id: null,
                                            })
                                        }
                                        className="w-full"
                                    />
                                )}

                                {question.type === 'single' && question.options && (
                                    <div className="space-y-2">
                                        {question.options.map((option) => (
                                            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`question_${question.id}`}
                                                    value={option.id}
                                                    checked={answers[question.id]?.option_id === option.id}
                                                    onChange={() =>
                                                        handleAnswerChange(question.id, {
                                                            option_id: option.id,
                                                            answer_text: null,
                                                        })
                                                    }
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{option.text}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'multi' && question.options && (
                                    <div className="space-y-2">
                                        {question.options.map((option) => (
                                            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={answers[question.id]?.option_id === option.id || (answers[question.id]?.answer_text || '').includes(option.id)}
                                                    onChange={(e) => {
                                                        const currentAnswerText = answers[question.id]?.answer_text || '';
                                                        const optionIds = currentAnswerText.split(',').filter((id) => id.length > 0);

                                                        if (e.target.checked) {
                                                            if (!optionIds.includes(option.id)) {
                                                                optionIds.push(option.id);
                                                            }
                                                        } else {
                                                            const index = optionIds.indexOf(option.id);
                                                            if (index > -1) {
                                                                optionIds.splice(index, 1);
                                                            }
                                                        }

                                                        handleAnswerChange(question.id, {
                                                            answer_text: optionIds.join(','),
                                                            option_id: null,
                                                        });
                                                    }}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{option.text}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="mb-6">
                        <p className="text-blue-700">Bardzo dziękujemy za poświęcony czas i wypełnienie ankiety.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                            {loading ? 'Wysyłanie...' : 'Wyślij ankietę'}
                        </Button>
                    </div>
                </form>
            </Card>
        </AnimatedSection>
    );
}

// Memoize the component to prevent unnecessary re-renders
export const SurveyWidget = memo(SurveyWidgetComponent);
