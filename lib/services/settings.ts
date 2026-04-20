import { getDB } from '@/lib/db';
import { safeEncryptPassword } from '@/lib/crypto';

export class SettingService {
  static async getAll() {
    const db = getDB();
    return await db.list<any>('site_settings', { orderBy: { column: 'key', ascending: true } });
  }

  static async getAllAsMap(): Promise<Record<string, string>> {
    const settings = await this.getAll();
    return (settings || []).reduce((acc: Record<string, string>, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }

  static async getByKey(key: string) {
    const db = getDB();
    return await db.findOne<any>('site_settings', { key });
  }

  static async upsert(key: string, value: string, userId?: string, description?: string) {
    const db = getDB();

    let processedValue = value;
    if (key === 'email_smtp_password' && value) {
      processedValue = safeEncryptPassword(value);
    }

    const existingSetting = await db.findOne<any>('site_settings', { key });

    if (existingSetting) {
      return await db.updateById('site_settings', existingSetting.id, {
        value: processedValue,
        description: description !== undefined ? description : existingSetting.description,
        updated_by: userId || null,
        updated_at: new Date().toISOString(),
      });
    } else {
      return await db.insert('site_settings', {
        key,
        value: processedValue,
        description,
        created_by: userId || null,
        updated_by: userId || null,
      });
    }
  }

  static async bulkUpsert(
    settings: { key: string; value: string; description?: string }[],
    userId?: string
  ) {
    const results = [];
    for (const setting of settings) {
      if (!setting.key) continue;
      try {
        const result = await this.upsert(setting.key, setting.value, userId, setting.description);
        results.push(result);
      } catch (error) {
        console.error(`Error processing setting ${setting.key}:`, error);
      }
    }
    return results;
  }

  static async deleteByKey(key: string) {
    const db = getDB();
    const setting = await db.findOne<any>('site_settings', { key });
    if (setting) {
      await db.deleteById('site_settings', setting.id);
      return true;
    }
    return false;
  }
}
