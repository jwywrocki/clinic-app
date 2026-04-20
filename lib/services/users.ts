import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/db';

function getPepper(): string {
  const pepper = process.env.BCRYPT_SECRET_KEY;
  if (!pepper) {
    throw new Error('BCRYPT_SECRET_KEY environment variable is required');
  }
  return pepper;
}

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export class UserService {
  static async getAllUsersWithRoles() {
    const db = getDB();
    const users = await db.list<any>('users');

    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user: any) => {
        const userRoles = await db.findWhere<any>('user_has_roles', { user_id: user.id });
        let roleName = '';
        if (userRoles.length > 0) {
          const role = await db.getById<any>('roles', userRoles[0].role_id);
          roleName = role?.name || '';
        }
        const { password_hash, ...userSafe } = user;
        return {
          ...userSafe,
          role: roleName,
          user_has_roles: userRoles.map((ur: any) => ({
            role: { id: ur.role_id, name: roleName },
          })),
        };
      })
    );

    return usersWithRoles;
  }

  static async getUserWithRole(userId: string) {
    const db = getDB();
    const user = await db.getById<any>('users', userId);
    if (!user) return null;

    const userRoles = await db.findWhere<any>('user_has_roles', { user_id: userId });
    let roleName = '';
    if (userRoles.length > 0) {
      const role = await db.getById<any>('roles', userRoles[0].role_id);
      roleName = role?.name || '';
    }

    const { password_hash, ...userSafe } = user;
    return {
      ...userSafe,
      role: roleName,
      user_has_roles: userRoles.map((ur: any) => ({ role: { id: ur.role_id, name: roleName } })),
    };
  }

  static async createUser(data: {
    username: string;
    password?: string;
    is_active?: boolean;
    role?: string;
  }) {
    const db = getDB();
    const { username, password, is_active, role } = data;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`);
    }

    // Check for duplicate username
    const existing = await db.findOne<any>('users', { username });
    if (existing) {
      throw new Error('Użytkownik o tej nazwie już istnieje');
    }

    const hash = await bcrypt.hash(password + getPepper(), SALT_ROUNDS);
    const now = new Date().toISOString();

    const user = await db.insert<any>('users', {
      username,
      password_hash: hash,
      is_active: is_active ?? true,
      created_at: now,
      updated_at: now,
    });

    if (!user) throw new Error('Failed to create user');

    if (role) {
      const roleData = await db.findOne<any>('roles', { name: role });
      if (!roleData) {
        throw new Error(`Role '${role}' not found`);
      }
      await db.insert('user_has_roles', { user_id: user.id, role_id: roleData.id });
    }

    return await this.getUserWithRole(user.id);
  }

  static async updateUser(
    id: string,
    data: { username?: string; password?: string; is_active?: boolean; role?: string }
  ) {
    const db = getDB();
    const { username, password, is_active, role } = data;

    const update: any = { updated_at: new Date().toISOString() };
    if (username !== undefined) update.username = username;
    if (is_active !== undefined) update.is_active = is_active;

    if (password?.trim()) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`);
      }
      update.password_hash = await bcrypt.hash(password + getPepper(), SALT_ROUNDS);
    }

    await db.updateById('users', id, update);

    if (role) {
      const existingRoles = await db.findWhere<any>('user_has_roles', { user_id: id });
      for (const ur of existingRoles) {
        await db.deleteById('user_has_roles', ur.id);
      }

      const roleData = await db.findOne<any>('roles', { name: role });
      if (!roleData) {
        throw new Error(`Role '${role}' not found`);
      }
      await db.insert('user_has_roles', { user_id: id, role_id: roleData.id });
    }

    return await this.getUserWithRole(id);
  }

  static async deleteUser(id: string) {
    const db = getDB();
    const user = await db.getById<any>('users', id);
    if (!user) throw new Error('User not found');

    const existingRoles = await db.findWhere<any>('user_has_roles', { user_id: id });
    for (const ur of existingRoles) {
      await db.deleteById('user_has_roles', ur.id);
    }

    await db.deleteById('users', id);
    return user;
  }
}
