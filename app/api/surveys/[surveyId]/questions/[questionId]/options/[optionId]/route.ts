import { NextResponse } from 'next/server';
import { updateQuestionOption, deleteQuestionOption, updateOptionOrder } from '@/lib/surveys-db';
import { QuestionOptionData } from '@/lib/types/surveys';

export async function PUT(
  request: Request,
  { params }: { params: { surveyId: string; questionId: string; optionId: string } }
) {
  try {
    const { optionId } = params;
    const updates = (await request.json()) as Partial<QuestionOptionData>;
    if (typeof updates.order_no === 'number') {
      const updatedOptionOrder = await updateOptionOrder(optionId, updates.order_no);
      return NextResponse.json(updatedOptionOrder);
    }
    const updatedOption = await updateQuestionOption(optionId, updates);
    return NextResponse.json(updatedOption);
  } catch (error: any) {
    console.error('Error in PUT /api/surveys/.../options/[optionId]:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { surveyId: string; questionId: string; optionId: string } }
) {
  try {
    const { optionId } = params;
    await deleteQuestionOption(optionId);
    return NextResponse.json({ message: 'Option deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/surveys/.../options/[optionId]:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
