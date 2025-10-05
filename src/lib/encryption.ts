/**
 * Client-side encryption utilities using Web Crypto API (AES-GCM)
 * All encryption happens in the browser - keys never leave the client
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Derive encryption key from user's password
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate a random salt
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Generate a random IV (Initialization Vector)
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

// Encrypt data
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = generateIV();
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    encoder.encode(data)
  );

  // Combine IV and encrypted data, then encode as base64
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// Decrypt data
export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. Invalid encryption key or corrupted data.');
  }
}

// Store salt in localStorage (salt is not secret, it's used to derive the key)
export function storeSalt(userId: string, salt: Uint8Array): void {
  localStorage.setItem(`vault_salt_${userId}`, btoa(String.fromCharCode(...salt)));
}

// Retrieve salt from localStorage
export function retrieveSalt(userId: string): Uint8Array | null {
  const saltStr = localStorage.getItem(`vault_salt_${userId}`);
  if (!saltStr) return null;
  
  return new Uint8Array(
    atob(saltStr)
      .split('')
      .map(char => char.charCodeAt(0))
  );
}

// Store encryption key in session (cleared when browser closes)
export function storeKeyInSession(userId: string, key: CryptoKey): void {
  // We can't directly store CryptoKey, so we export it first
  crypto.subtle.exportKey('raw', key).then(keyData => {
    const keyArray = new Uint8Array(keyData);
    sessionStorage.setItem(`vault_key_${userId}`, btoa(String.fromCharCode(...keyArray)));
  });
}

// Retrieve encryption key from session
export async function retrieveKeyFromSession(userId: string): Promise<CryptoKey | null> {
  const keyStr = sessionStorage.getItem(`vault_key_${userId}`);
  if (!keyStr) return null;

  try {
    const keyData = new Uint8Array(
      atob(keyStr)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Failed to retrieve key from session:', error);
    return null;
  }
}

// Clear encryption key from session
export function clearKeyFromSession(userId: string): void {
  sessionStorage.removeItem(`vault_key_${userId}`);
}
