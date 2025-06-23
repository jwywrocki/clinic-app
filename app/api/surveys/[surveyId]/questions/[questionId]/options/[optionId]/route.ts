import { NextResponse } from 'next/server';
import { updateQuestionOption, deleteQuestionOption, updateOptionOrder } from '@/lib/surveys-db';
import { QuestionOptionData } from '@/lib/types/surveys';

// PUT to update an option
export async function PUT(request: Request, { params }: { params: { surveyId: string; questionId: string; optionId: string } }) {
    try {
        const { optionId } = await params;
        const updates = (await request.json()) as Partial<QuestionOptionData>;
        if (typeof updates.order_no === 'number') {
            const updatedOptionOrder = await updateOptionOrder(optionId, updates.order_no);
            return NextResponse.json(updatedOptionOrder);
        }
        const updatedOption = await updateQuestionOption(optionId, updates);
        return NextResponse.json(updatedOption);
    } catch (error: any) {
        console.error('Error in PUT /api/surveys/.../options/[optionId]:', error);
        return NextResponse.json({ error: error.message || 'Failed to update option' }, { status: 500 });
    }
}

// DELETE an option
export async function DELETE(request: Request, { params }: { params: { surveyId: string; questionId: string; optionId: string } }) {
    try {
        const { optionId } = await params;
        await deleteQuestionOption(optionId);
        return NextResponse.json({ message: 'Option deleted successfully' });
    } catch (error: any) {
        console.error('Error in DELETE /api/surveys/.../options/[optionId]:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete option' }, { status: 500 });
    }
}
