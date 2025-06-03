export interface User {
    id: string;
    username: string;
    password_hash?: string;
    password?: string;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
    role?: string;
}

export interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    meta_description?: string;
    is_published: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

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

export interface ContactDetail {
    id: string;
    group_id: string;
    type: 'phone' | 'email' | 'address' | 'hours' | 'emergency_contact';
    value: string;
    created_at: string;
    updated_at: string;
}

export interface ContactGroup {
    id: string;
    label: string;
    featured: boolean;
    created_at: string;
    updated_at: string;
    contact_details?: ContactDetail[];
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    created_at: string;
    updated_at: string;
}

export interface NewsItem {
    id: string;
    title: string;
    content: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

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

export interface AdminContextType {
    currentUser: User | null;
    hasPermission: (permission: string) => boolean;
    loading: boolean;
    fetchData: () => Promise<void>;
}
