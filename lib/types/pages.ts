export interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    meta_description?: string;
    is_published: boolean;
    created_by?: string;
    survey_id?: string;
    doctors_category?: string | null;
    created_at: string;
    updated_at: string;
}
