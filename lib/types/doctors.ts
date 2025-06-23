export interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    order_position?: number;
    created_at: string;
    updated_at: string;
}
