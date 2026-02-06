const crypto = require('crypto');

// Encryption algorithm and key setup
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Validation
if (!ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY not set. Using default key for development only!');
  console.warn('⚠️  Set ENCRYPTION_KEY environment variable in production!');
}

// Use env key or generate a consistent dev key (NOT FOR PRODUCTION)
const KEY = ENCRYPTION_KEY 
  ? Buffer.from(ENCRYPTION_KEY, 'hex')
  : crypto.createHash('sha256').update('dev-only-mailguard-key').digest();

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:authTag:encrypted
 */
function encrypt(text) {
  if (!text) return null;
  
  try {
    // Generate random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('❌ Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text encrypted with encrypt()
 * @param {string} encryptedData - Encrypted text in format: iv:authTag:encrypted
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedData) {
  if (!encryptedData) return null;
  
  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    
    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
}

module.exports = {
  encrypt,
  decrypt,
};
