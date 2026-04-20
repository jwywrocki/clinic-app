import { getDB } from '@/lib/db';
import type { Survey, Question, QuestionOption, SurveyAnswer, SurveySubmission, SurveyData, QuestionData, QuestionOptionData, SurveyResponseRow } from './types/surveys';

// Survey CRUD
export async function createSurvey(surveyData: SurveyData): Promise<Survey> {
    const db = getDB();
    return db.insert<Survey>('surveys', surveyData);
}

export async function getSurveyById(id: string): Promise<Survey | null> {
    const db = getDB();
    const survey = await db.getById<Survey>('surveys', id);
    if (!survey) return null;

    // Fetch questions for this survey
    const questions = await db.findWhere<any>('question_has_survey', { survey_id: id }, { orderBy: { column: 'order_no', ascending: true } });

    // Fetch options for each question
    const questionsWithOptions = await Promise.all(
        questions.map(async (q: any) => {
            const options = await db.findWhere<any>('option_has_question', { question_id: q.id }, { orderBy: { column: 'order_no', ascending: true } });
            return { ...q, options };
        })
    );

    return { ...survey, questions: questionsWithOptions } as any;
}

export async function getAllSurveys(): Promise<Survey[]> {
    const db = getDB();
    return db.list<Survey>('surveys', { orderBy: { column: 'created_at', ascending: false } });
}

export async function updateSurvey(id: string, updates: Partial<SurveyData>): Promise<Survey> {
    const db = getDB();
    return db.updateById<Survey>('surveys', id, { ...updates, updated_at: new Date().toISOString() } as any);
}

export async function deleteSurvey(id: string): Promise<void> {
    const db = getDB();
    await db.deleteById('surveys', id);
}

// Question CRUD
export async function addQuestionToSurvey(surveyId: string, questionData: QuestionData): Promise<Question> {
    const db = getDB();
    return db.insert<Question>('question_has_survey', { ...questionData, survey_id: surveyId } as any);
}

export async function updateQuestion(id: string, updates: Partial<QuestionData>): Promise<Question> {
    const db = getDB();
    return db.updateById<Question>('question_has_survey', id, updates as any);
}

export async function deleteQuestion(id: string): Promise<void> {
    const db = getDB();
    await db.deleteById('question_has_survey', id);
}

// Question Option CRUD
export async function addOptionToQuestion(questionId: string, optionData: QuestionOptionData): Promise<QuestionOption> {
    const db = getDB();
    return db.insert<QuestionOption>('option_has_question', { ...optionData, question_id: questionId } as any);
}

export async function updateQuestionOption(id: string, updates: Partial<QuestionOptionData>): Promise<QuestionOption> {
    const db = getDB();
    return db.updateById<QuestionOption>('option_has_question', id, updates as any);
}

export async function deleteQuestionOption(id: string): Promise<void> {
    const db = getDB();
    await db.deleteById('option_has_question', id);
}

// Survey Submission
export async function submitSurveyResponse(submission: SurveySubmission): Promise<string> {
    const db = getDB();
    const responseId = crypto.randomUUID();
    const answersToInsert = submission.answers.map((answer) => ({
        survey_id: submission.survey_id,
        question_id: answer.question_id,
        option_id: answer.option_id,
        answer_text: answer.answer_text,
        response_id: responseId,
        submitted_at: new Date().toISOString(),
    }));

    try {
        await db.insertMany('survey_answers', answersToInsert);
    } catch (error) {
        console.error('[submitSurveyResponse] Database error:', error);
        throw error;
    }

    return responseId;
}

// Get Survey for Public Page
export async function getPublishedSurveyForPage(surveyId: string): Promise<Survey | null> {
    try {
        const db = getDB();

        // Fetch the published survey
        const survey = await db.findOne<Survey>('surveys', { id: surveyId, is_published: true });
        if (!survey) return null;

        // Fetch questions ordered by order_no
        const questions = await db.findWhere<any>('question_has_survey', { survey_id: surveyId }, { orderBy: { column: 'order_no', ascending: true } });

        // Fetch options for each question
        const questionsWithOptions = await Promise.all(
            questions.map(async (q: any) => {
                const options = await db.findWhere<any>('option_has_question', { question_id: q.id }, { orderBy: { column: 'order_no', ascending: true } });
                return { ...q, options };
            })
        );

        return { ...survey, questions: questionsWithOptions } as any;
    } catch (error) {
        console.error('Error fetching published survey:', error);
        throw error;
    }
}

// CSV Export Logic
export async function getSurveyResponsesForExport(surveyId: string): Promise<SurveyResponseRow[]> {
    const db = getDB();

    // Fetch all answers for this survey
    const answers = await db.findWhere<any>('survey_answers', { survey_id: surveyId }, { orderBy: { column: 'submitted_at', ascending: false } });
    if (!answers || answers.length === 0) return [];

    // Collect unique question_ids and option_ids for batch lookup
    const questionIds = [...new Set(answers.map((a: any) => a.question_id).filter(Boolean))];
    const optionIds = [...new Set(answers.map((a: any) => a.option_id).filter(Boolean))];

    // Fetch questions and options
    const questionsMap = new Map<string, any>();
    for (const qId of questionIds) {
        const q = await db.getById<any>('question_has_survey', qId);
        if (q) questionsMap.set(qId, q);
    }

    const optionsMap = new Map<string, any>();
    for (const oId of optionIds) {
        const o = await db.getById<any>('option_has_question', oId);
        if (o) optionsMap.set(oId, o);
    }

    const responsesMap = new Map<string, SurveyResponseRow>();

    for (const answer of answers) {
        if (!responsesMap.has(answer.response_id)) {
            responsesMap.set(answer.response_id, {
                response_id: answer.response_id,
                submitted_at: answer.submitted_at,
            });
        }

        const responseRow = responsesMap.get(answer.response_id)!;
        const question = questionsMap.get(answer.question_id);
        if (!question) continue;

        const questionText = question.text;

        if (question.type === 'text') {
            responseRow[questionText] = answer.answer_text || '';
        } else if (answer.option_id) {
            const option = optionsMap.get(answer.option_id);
            const optionText = option?.text || '';
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
    const db = getDB();
    return db.updateById<Question>('question_has_survey', questionId, { order_no: orderNo } as any);
}

export async function updateOptionOrder(optionId: string, orderNo: number): Promise<QuestionOption> {
    const db = getDB();
    return db.updateById<QuestionOption>('option_has_question', optionId, { order_no: orderNo } as any);
}
