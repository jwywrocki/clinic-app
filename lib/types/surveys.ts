export interface Survey {
    id: string;
    title: string;
    is_published: boolean;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
    questions?: Question[];
}

export interface Question {
    id: string;
    survey_id: string;
    text: string;
    type: 'single' | 'multi' | 'text';
    order_no: number;
    options?: QuestionOption[];
}

export interface QuestionOption {
    id: string;
    question_id: string;
    text: string;
    order_no: number;
}

export interface SurveyAnswer {
    id: string;
    survey_id: string;
    question_id: string;
    option_id?: string | null;
    answer_text?: string | null;
    response_id: string;
    submitted_at: string;
}

export interface SurveySubmissionAnswer {
    question_id: string;
    option_id?: string | null;
    answer_text?: string | null;
}
export interface SurveySubmission {
    survey_id: string;
    answers: SurveySubmissionAnswer[];
}

export interface SurveyResponseRow {
    response_id: string;
    submitted_at: string;
    [questionText: string]: string;
}

export type SurveyData = Omit<Survey, 'id' | 'created_at' | 'updated_at' | 'questions'>;
export type QuestionData = Omit<Question, 'id' | 'options'>;
export type QuestionOptionData = Omit<QuestionOption, 'id'>;
