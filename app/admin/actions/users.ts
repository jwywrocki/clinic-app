'use server';

import { UserService } from '@/lib/services/users';
import { User } from '@/lib/types/users';
import { revalidatePath } from 'next/cache';

export async function saveUserAction(data: Partial<User>) {
    try {
        if (data.id) {
            // Update
            const payload: any = {};
            if (data.username !== undefined) payload.username = data.username;
            if (data.password_hash !== undefined) payload.password = data.password_hash;
            if (data.is_active !== undefined) payload.is_active = data.is_active;
            if (data.role !== undefined) payload.role = data.role;
            
            await UserService.updateUser(data.id, payload);
        } else {
            // Create
            if (!data.username || !data.password_hash) {
                return { success: false, error: 'Username and password are required' };
            }
            const payload: any = {
                username: data.username,
                password: data.password_hash,
                is_active: data.is_active ?? true
            };
            if (data.role !== undefined) payload.role = data.role;
            
            await UserService.createUser(payload);
        }
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving user:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteUserAction(id: string): Promise<void> {
    try {
        await UserService.deleteUser(id);
        revalidatePath('/admin/users');
    } catch (error: any) {
        console.error('Error deleting user:', error);
        throw new Error(error.message);
    }
}
