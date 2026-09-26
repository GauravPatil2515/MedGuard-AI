/**
 * Privacy-First Encrypted Patient Data Storage (Web Crypto API + IndexedDB)
 * --------------------------------------------------------------------------
 * Encrypts all patient health data, prescriptions, OCR text, and risk flags
 * locally in the browser with AES-GCM (256-bit) using a session-derived key.
 * No health data ever leaves the device or gets stored in a remote database.
 */

const DB_NAME = 'medguard_patient_vault';
const STORE_NAME = 'records';

// Generate or derive a cryptographic key from session
async function getEncryptionKey(): Promise<CryptoKey> {
  let rawKey = sessionStorage.getItem('medguard_enc_key');
  if (!rawKey) {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    rawKey = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('medguard_enc_key', rawKey);
  }

  const keyBuffer = new Uint8Array(rawKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Encrypt and save a record into IndexedDB.
 */
export async function saveEncryptedRecord(id: string, data: any): Promise<void> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      id,
      iv: Array.from(iv),
      cipher: Array.from(new Uint8Array(cipherBuffer)),
      savedAt: new Date().toISOString()
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Decrypt and retrieve a record from IndexedDB.
 */
export async function getDecryptedRecord<T = any>(id: string): Promise<T | null> {
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = async () => {
      if (!req.result) return resolve(null);
      try {
        const key = await getEncryptionKey();
        const iv = new Uint8Array(req.result.iv);
        const cipher = new Uint8Array(req.result.cipher);

        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          cipher
        );

        const decoded = new TextDecoder().decode(decryptedBuffer);
        resolve(JSON.parse(decoded));
      } catch (e) {
        console.error('Decryption failed:', e);
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all stored records decrypted.
 */
export async function getAllDecryptedRecords(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = async () => {
      const records = req.result || [];
      const results: any[] = [];
      const key = await getEncryptionKey();

      for (const r of records) {
        try {
          const iv = new Uint8Array(r.iv);
          const cipher = new Uint8Array(r.cipher);
          const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            cipher
          );
          const decoded = new TextDecoder().decode(decryptedBuffer);
          results.push({ id: r.id, ...JSON.parse(decoded), savedAt: r.savedAt });
        } catch {}
      }
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}
