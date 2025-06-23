import { NextResponse } from 'next/server';
import { updateQuestion, deleteQuestion, updateQuestionOrder } from '@/lib/surveys-db';
import { QuestionData } from '@/lib/types/surveys';

// PUT to update a question
export async function PUT(request: Request, { params }: { params: { surveyId: string; questionId: string } }) {
    try {
        const { questionId } = await params;
        const updates = (await request.json()) as Partial<QuestionData>;
        if (typeof updates.order_no === 'number') {
            const updatedQuestionOrder = await updateQuestionOrder(questionId, updates.order_no);
            return NextResponse.json(updatedQuestionOrder);
        }
        const updatedQuestion = await updateQuestion(questionId, updates);
        return NextResponse.json(updatedQuestion);
    } catch (error: any) {
        console.error('Error in PUT /api/surveys/[surveyId]/questions/[questionId]:', error);
        return NextResponse.json({ error: error.message || 'Failed to update question' }, { status: 500 });
    }
}

// DELETE a question
export async function DELETE(request: Request, { params }: { params: { surveyId: string; questionId: string } }) {
    try {
        const { questionId } = await params;
        await deleteQuestion(questionId);
        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error: any) {
        console.error('Error in DELETE /api/surveys/[surveyId]/questions/[questionId]:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete question' }, { status: 500 });
    }
}
