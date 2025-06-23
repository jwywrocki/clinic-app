import { NextResponse } from 'next/server';
import {
    createSurvey,
    getAllSurveys,
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    addQuestionToSurvey,
    updateQuestion,
    deleteQuestion,
    addOptionToQuestion,
    updateQuestionOption,
    deleteQuestionOption,
    submitSurveyResponse,
    getSurveyResponsesForExport,
    updateQuestionOrder,
    updateOptionOrder,
} from '@/lib/surveys-db';
import { SurveyData, QuestionData, QuestionOptionData, SurveySubmission } from '@/lib/types/surveys';

// GET all surveys (for admin listing)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const exportSurveyId = searchParams.get('exportSurveyId');

        if (id) {
            const survey = await getSurveyById(id);
            if (!survey) {
                return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
            }
            return NextResponse.json(survey);
        }

        if (exportSurveyId) {
            const responses = await getSurveyResponsesForExport(exportSurveyId);

            if (responses.length === 0) {
                return NextResponse.json({ message: 'No responses to export' }, { status: 200 });
            }

            const headers = Object.keys(responses[0]);
            const csvRows = [headers.join(','), ...responses.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(','))];
            const csvContent = csvRows.join('\n');
            return new Response(csvContent, {
                status: 200,
                headers: {
                    'Content-Disposition': `attachment; filename="survey_${exportSurveyId}_export.csv"`,
                    'Content-Type': 'text/csv',
                },
            });
        }

        const surveys = await getAllSurveys();
        return NextResponse.json(surveys);
    } catch (error: any) {
        console.error('Error in GET /api/surveys:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch surveys' }, { status: 500 });
    }
}

// POST a new survey or submit a survey response
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.answers && body.survey_id) {
            const submission = body as SurveySubmission;

            // Validate submission
            if (!Array.isArray(submission.answers) || submission.answers.length === 0) {
                return NextResponse.json(
                    {
                        error: 'Brak odpowiedzi w ankiecie',
                        details: 'Musisz odpowiedzieć na co najmniej jedno pytanie aby wysłać ankietę',
                    },
                    { status: 400 }
                );
            }

            // Validate each answer
            for (const answer of submission.answers) {
                if (!answer.question_id) {
                    return NextResponse.json(
                        {
                            error: 'Nieprawidłowe dane ankiety',
                            details: 'Każda odpowiedź musi być powiązana z pytaniem',
                        },
                        { status: 400 }
                    );
                }
            }

            const responseId = await submitSurveyResponse(submission);
            return NextResponse.json({ message: 'Survey submitted successfully', responseId }, { status: 201 });
        } else {
            const surveyData = body as SurveyData;
            const newSurvey = await createSurvey(surveyData);
            return NextResponse.json(newSurvey, { status: 201 });
        }
    } catch (error: any) {
        console.error('[API /surveys POST] Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to process request',
                details: error.stack || 'No stack trace available',
            },
            { status: 500 }
        );
    }
}

// PUT to update a survey
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
        }
        const updates = (await request.json()) as Partial<SurveyData>;
        const updatedSurvey = await updateSurvey(id, updates);
        return NextResponse.json(updatedSurvey);
    } catch (error: any) {
        console.error('Error in PUT /api/surveys:', error);
        return NextResponse.json({ error: error.message || 'Failed to update survey' }, { status: 500 });
    }
}

// DELETE a survey
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
        }
        await deleteSurvey(id);
        return NextResponse.json({ message: 'Survey deleted successfully' });
    } catch (error: any) {
        console.error('Error in DELETE /api/surveys:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete survey' }, { status: 500 });
    }
}
