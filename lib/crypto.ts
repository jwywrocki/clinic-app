/**
 * Encryption utilities for SMTP passwords and other sensitive data
 * Uses AES-256-CBC encryption for secure password storage
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, IV is 16 bytes
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): string {
    const key = process.env.BCRYPT_SECRET_KEY;
    if (!key) {
        throw new Error('BCRYPT_SECRET_KEY not found in environment variables');
    }
    return key;
}

/**
 * Derives a key from the base secret using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}

/**
 * Encrypt sensitive data (like SMTP passwords)
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: salt:iv:encryptedData
 */
export function encryptSensitiveData(text: string): string {
    if (!text) return '';

    try {
        const baseKey = getEncryptionKey();
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = deriveKey(baseKey, salt);
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Format: salt:iv:encryptedData
        return [salt.toString('hex'), iv.toString('hex'), encrypted].join(':');
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt sensitive data');
    }
}

/**
 * Decrypt sensitive data (like SMTP passwords)
 * @param encryptedText - Encrypted string in format: salt:iv:encryptedData
 * @returns Decrypted plain text
 */
export function decryptSensitiveData(encryptedText: string): string {
    if (!encryptedText) return '';

    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const [saltHex, ivHex, encrypted] = parts;
        const baseKey = getEncryptionKey();
        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');

        const key = deriveKey(baseKey, salt);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt sensitive data');
    }
}

/**
 * Check if data appears to be encrypted
 * @param data - Data to check
 * @returns true if data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
    if (!data) return false;

    const parts = data.split(':');
    return parts.length === 3 && parts.every((part) => /^[a-f0-9]+$/i.test(part));
}

/**
 * Safely encrypt password only if it's not already encrypted
 * @param password - Password to encrypt
 * @returns Encrypted password or original if already encrypted
 */
export function safeEncryptPassword(password: string): string {
    if (!password) return '';
    if (isEncrypted(password)) return password;
    return encryptSensitiveData(password);
}

/**
 * Generate a secure random string for passwords/keys
 * @param length - Length of the string to generate
 * @returns Random string
 */
export function generateSecureString(length: number = 32): string {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}
