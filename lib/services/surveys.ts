import { getDB } from '@/lib/db';

export class SurveyService {
  /**
   * Gets aggregate statistics about all surveys
   */
  static async getStats() {
    const db = getDB();

    // Count surveys by status using targeted queries
    const totalSurveys = await db.count('surveys');
    const publishedSurveys = await db.count('surveys', { is_published: true });
    const draftSurveys = totalSurveys - publishedSurveys;

    // Count unique response IDs — fetch only the columns we need
    const responsesData = await db.findWhere<any>('survey_answers', {});

    // Count unique response IDs
    const uniqueResponseIds = new Set(responsesData.map((r: any) => r.response_id));
    const totalResponses = uniqueResponseIds.size;

    // Get recent responses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentResponses = new Set(
      responsesData
        .filter((r: any) => new Date(r.submitted_at) >= sevenDaysAgo)
        .map((r: any) => r.response_id)
    ).size;

    // Get most active survey
    let mostActiveSurvey = null;
    if (totalResponses > 0) {
      const surveyResponseMap = new Map<string, Set<string>>();
      responsesData.forEach((item: any) => {
        if (!surveyResponseMap.has(item.survey_id)) {
          surveyResponseMap.set(item.survey_id, new Set());
        }
        surveyResponseMap.get(item.survey_id)!.add(item.response_id);
      });

      let maxResponses = 0;
      let mostActiveSurveyId: string | null = null;

      for (const [surveyId, responseIds] of surveyResponseMap) {
        if (responseIds.size > maxResponses) {
          maxResponses = responseIds.size;
          mostActiveSurveyId = surveyId;
        }
      }

      if (mostActiveSurveyId) {
        const surveyDetails = await db.getById<any>('surveys', mostActiveSurveyId);
        if (surveyDetails) {
          mostActiveSurvey = {
            title: surveyDetails.title,
            responses: maxResponses,
          };
        }
      }
    }

    return {
      total_surveys: totalSurveys,
      published_surveys: publishedSurveys,
      draft_surveys: draftSurveys,
      total_responses: totalResponses,
      recent_responses: recentResponses,
      most_active_survey: mostActiveSurvey,
    };
  }
}
