import { createSupabaseClient } from './supabase';
import type { Survey, Question, QuestionOption, SurveyAnswer, SurveySubmission, SurveyData, QuestionData, QuestionOptionData, SurveyResponseRow } from './types/surveys';

// Survey CRUD
export async function createSurvey(surveyData: SurveyData): Promise<Survey> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('surveys').insert(surveyData).select().single();
    if (error) throw error;
    return data;
}

export async function getSurveyById(id: string): Promise<Survey | null> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('surveys').select('*, questions:question_has_survey(*, options:option_has_question(*))').eq('id', id).single();
    if (error) throw error;
    if (data && data.questions) {
        data.questions.sort((a: any, b: any) => a.order_no - b.order_no);
        data.questions.forEach((q: any) => q.options?.sort((a: any, b: any) => a.order_no - b.order_no));
    }
    return data;
}

export async function getAllSurveys(): Promise<Survey[]> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('surveys').select('id, title, is_published, created_at, updated_at').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function updateSurvey(id: string, updates: Partial<SurveyData>): Promise<Survey> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('surveys')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteSurvey(id: string): Promise<void> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.from('surveys').delete().eq('id', id);
    if (error) throw error;
}

// Question CRUD
export async function addQuestionToSurvey(surveyId: string, questionData: QuestionData): Promise<Question> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('question_has_survey')
        .insert({ ...questionData, survey_id: surveyId })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateQuestion(id: string, updates: Partial<QuestionData>): Promise<Question> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('question_has_survey').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteQuestion(id: string): Promise<void> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.from('question_has_survey').delete().eq('id', id);
    if (error) throw error;
}

// Question Option CRUD
export async function addOptionToQuestion(questionId: string, optionData: QuestionOptionData): Promise<QuestionOption> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('option_has_question')
        .insert({ ...optionData, question_id: questionId })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateQuestionOption(id: string, updates: Partial<QuestionOptionData>): Promise<QuestionOption> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('option_has_question').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteQuestionOption(id: string): Promise<void> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.from('option_has_question').delete().eq('id', id);
    if (error) throw error;
}

// Survey Submission
export async function submitSurveyResponse(submission: SurveySubmission): Promise<string> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const responseId = crypto.randomUUID();
    const answersToInsert = submission.answers.map((answer) => ({
        survey_id: submission.survey_id,
        question_id: answer.question_id,
        option_id: answer.option_id,
        answer_text: answer.answer_text,
        response_id: responseId,
        submitted_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('survey_answers').insert(answersToInsert);
    if (error) {
        console.error('[submitSurveyResponse] Database error:', error);
        throw error;
    }

    return responseId;
}

// Get Survey for Public Page
export async function getPublishedSurveyForPage(surveyId: string): Promise<Survey | null> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    try {
        // Optimized query with proper ordering at database level
        const { data, error } = await supabase
            .from('surveys')
            .select(
                `
                *,
                questions:question_has_survey(
                    *,
                    options:option_has_question(*)
                )
            `
            )
            .eq('id', surveyId)
            .eq('is_published', true)
            .order('order_no', { referencedTable: 'question_has_survey' })
            .order('order_no', { referencedTable: 'question_has_survey.option_has_question' })
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found, or not published
            throw error;
        }

        // Fallback sorting if database ordering doesn't work as expected
        if (data && data.questions) {
            data.questions.sort((a: any, b: any) => (a.order_no || 0) - (b.order_no || 0));
            data.questions.forEach((q: any) => {
                if (q.options) {
                    q.options.sort((a: any, b: any) => (a.order_no || 0) - (b.order_no || 0));
                }
            });
        }

        return data;
    } catch (error) {
        console.error('Error fetching published survey:', error);
        throw error;
    }
}

// CSV Export Logic
export async function getSurveyResponsesForExport(surveyId: string): Promise<SurveyResponseRow[]> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data: answers, error: answersError } = await supabase
        .from('survey_answers')
        .select(
            `
      response_id,
      submitted_at,
      answer_text,
      question:question_has_survey(text, type),
      option:option_has_question(text)
    `
        )
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false });

    if (answersError) throw answersError;
    if (!answers) return [];

    const responsesMap = new Map<string, SurveyResponseRow>();

    for (const answer of answers) {
        if (!responsesMap.has(answer.response_id)) {
            responsesMap.set(answer.response_id, {
                response_id: answer.response_id,
                submitted_at: answer.submitted_at,
            });
        }

        const responseRow = responsesMap.get(answer.response_id)!;
        const questionText = (answer.question as any).text;

        if ((answer.question as any).type === 'text') {
            responseRow[questionText] = answer.answer_text || '';
        } else if (answer.option) {
            const optionText = (answer.option as any).text;
            if (responseRow[questionText]) {
                responseRow[questionText] += ', ' + optionText;
            } else {
                responseRow[questionText] = optionText;
            }
        }
    }
    return Array.from(responsesMap.values());
}

export async function updateQuestionOrder(questionId: string, orderNo: number): Promise<Question> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('question_has_survey').update({ order_no: orderNo }).eq('id', questionId).select().single();
    if (error) throw error;
    return data;
}

export async function updateOptionOrder(optionId: string, orderNo: number): Promise<QuestionOption> {
    const supabase = createSupabaseClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.from('option_has_question').update({ order_no: orderNo }).eq('id', optionId).select().single();
    if (error) throw error;
    return data;
}
