import { NextResponse } from 'next/server';
import { getPublishedSurveyForPage } from '@/lib/surveys-db';

// GET a published survey for public page
export async function GET(request: Request, { params }: { params: Promise<{ surveyId: string }> }) {
    try {
        const { surveyId } = await params;
        const survey = await getPublishedSurveyForPage(surveyId);

        if (!survey) {
            return NextResponse.json({ error: 'Survey not found or not published' }, { status: 404 });
        }

        // Add caching headers for better performance
        const response = NextResponse.json(survey);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

        return response;
    } catch (error: any) {
        console.error('Error in GET /api/public/surveys/[surveyId]:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch survey' }, { status: 500 });
    }
}
