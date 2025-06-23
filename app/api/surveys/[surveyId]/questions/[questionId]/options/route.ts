import { NextResponse } from 'next/server';
import { addOptionToQuestion, updateQuestionOption, deleteQuestionOption, updateOptionOrder } from '@/lib/surveys-db';
import { QuestionOptionData } from '@/lib/types/surveys';

// POST a new option to a question
export async function POST(request: Request, { params }: { params: { surveyId: string; questionId: string } }) {
    try {
        const { questionId } = await params;
        const optionData = (await request.json()) as QuestionOptionData;
        if (!questionId) {
            return NextResponse.json({ error: 'Question ID is required in path' }, { status: 400 });
        }
        const newOption = await addOptionToQuestion(questionId, optionData);
        return NextResponse.json(newOption, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/surveys/.../options:', error);
        return NextResponse.json({ error: error.message || 'Failed to add option' }, { status: 500 });
    }
}
