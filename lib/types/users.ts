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

export interface AdminContextType {
    currentUser: User | null;
    hasPermission: (permission: string) => boolean;
    loading: boolean;
    fetchData: () => Promise<void>;
}
