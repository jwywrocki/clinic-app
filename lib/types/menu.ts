export interface MenuItem {
    id: string;
    title: string;
    url: string;
    order_position: number;
    parent_id?: string;
    is_published: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
}
