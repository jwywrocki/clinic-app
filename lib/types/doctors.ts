export interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    bio?: string;
    image_url?: string;
    schedule?: string;
    is_active: boolean;
    order_position?: number;
    menu_category: string;
    created_at: string;
    updated_at: string;
}
