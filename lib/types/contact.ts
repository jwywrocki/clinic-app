export interface ContactDetail {
    id: string;
    group_id: string;
    type: 'phone' | 'email' | 'address' | 'hours' | 'emergency_contact';
    value: string;
    order_position: number;
    created_at: string;
    updated_at: string;
}

export interface ContactGroup {
    id: string;
    label: string;
    in_hero: boolean;
    in_footer: boolean;
    order_position: number;
    created_at: string;
    updated_at: string;
    contact_details?: ContactDetail[];
}
