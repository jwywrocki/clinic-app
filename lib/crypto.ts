import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): string {
  const key = process.env.BCRYPT_SECRET_KEY;
  if (!key) {
    throw new Error('BCRYPT_SECRET_KEY not found in environment variables');
  }
  return key;
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}

export function encryptSensitiveData(text: string): string {
  if (!text) return '';

  try {
    const baseKey = getEncryptionKey();
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(baseKey, salt);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Format: salt:iv:authTag:encryptedData
    return [salt.toString('hex'), iv.toString('hex'), authTag, encrypted].join(':');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

export function decryptSensitiveData(encryptedText: string): string {
  if (!encryptedText) return '';

  try {
    const parts = encryptedText.split(':');

    if (parts.length === 4) {
      const [saltHex, ivHex, authTagHex, encrypted] = parts;
      const baseKey = getEncryptionKey();
      const salt = Buffer.from(saltHex!, 'hex');
      const iv = Buffer.from(ivHex!, 'hex');
      const authTag = Buffer.from(authTagHex!, 'hex');
      const key = deriveKey(baseKey, salt);

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });
      decipher.setAuthTag(authTag);

      let decrypted: string = decipher.update(encrypted!, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    if (parts.length === 3) {
      // Legacy CBC format
      const [saltHex, ivHex, encrypted] = parts;
      const baseKey = getEncryptionKey();
      const salt = Buffer.from(saltHex!, 'hex');
      const iv = Buffer.from(ivHex!, 'hex');
      const key = deriveKey(baseKey, salt);

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted: string = decipher.update(encrypted!, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    throw new Error('Invalid encrypted data format');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Check if data appears to be encrypted (GCM=4 parts, legacy CBC=3 parts)
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;
  const parts = data.split(':');
  return (
    (parts.length === 3 || parts.length === 4) && parts.every(part => /^[a-f0-9]+$/i.test(part))
  );
}

export function safeEncryptPassword(password: string): string {
  if (!password) return '';
  if (isEncrypted(password)) return password;
  return encryptSensitiveData(password);
}

export function generateSecureString(length: number = 32): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
