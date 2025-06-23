import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // Get total surveys count
        const { data: surveysData, error: surveysError } = await supabase.from('surveys').select('id, is_published');

        if (surveysError) {
            console.error('Error fetching surveys:', surveysError);
            return NextResponse.json({ error: 'Failed to fetch surveys', details: surveysError.message }, { status: 500 });
        }

        const totalSurveys = surveysData?.length || 0;
        const publishedSurveys = surveysData?.filter((s) => s.is_published).length || 0;
        const draftSurveys = totalSurveys - publishedSurveys;

        // Get total responses count - count unique response_ids
        const { data: responsesData, error: responsesError } = await supabase.from('survey_answers').select('response_id');

        if (responsesError) {
            console.error('Error fetching responses:', responsesError);
        }

        // Count unique response IDs
        const uniqueResponseIds = new Set(responsesData?.map((r) => r.response_id) || []);
        const totalResponses = uniqueResponseIds.size;

        // Get recent responses (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentResponsesData, error: recentError } = await supabase.from('survey_answers').select('response_id, submitted_at').gte('submitted_at', sevenDaysAgo.toISOString());

        if (recentError) {
            console.error('Error fetching recent responses:', recentError);
        }

        // Count unique recent response IDs
        const uniqueRecentResponseIds = new Set(recentResponsesData?.map((r) => r.response_id) || []);
        const recentResponses = uniqueRecentResponseIds.size;

        // Get most active survey
        let mostActiveSurvey = null;
        if (totalResponses > 0) {
            const { data: surveyResponseCounts, error: countError } = await supabase.from('survey_answers').select('survey_id, response_id');

            if (!countError && surveyResponseCounts) {
                // Count responses per survey
                const surveyResponseMap = new Map<string, Set<string>>();

                surveyResponseCounts.forEach((item: any) => {
                    if (!surveyResponseMap.has(item.survey_id)) {
                        surveyResponseMap.set(item.survey_id, new Set());
                    }
                    surveyResponseMap.get(item.survey_id)!.add(item.response_id);
                });

                // Find survey with most responses
                let maxResponses = 0;
                let mostActiveSurveyId = null;

                for (const [surveyId, responseIds] of surveyResponseMap) {
                    if (responseIds.size > maxResponses) {
                        maxResponses = responseIds.size;
                        mostActiveSurveyId = surveyId;
                    }
                }

                if (mostActiveSurveyId) {
                    const { data: surveyDetails } = await supabase.from('surveys').select('title').eq('id', mostActiveSurveyId).single();

                    if (surveyDetails) {
                        mostActiveSurvey = {
                            title: surveyDetails.title,
                            responses: maxResponses,
                        };
                    }
                }
            }
        }

        return NextResponse.json({
            total_surveys: totalSurveys,
            published_surveys: publishedSurveys,
            draft_surveys: draftSurveys,
            total_responses: totalResponses,
            recent_responses: recentResponses,
            most_active_survey: mostActiveSurvey,
        });
    } catch (error) {
        console.error('Surveys stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
