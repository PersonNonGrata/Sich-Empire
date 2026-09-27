import { GameState } from '../game/state/types.ts';
import { migrateSave } from './migration.ts';

const DB_NAME = 'imperiya_sich_db';
const DB_VERSION = 1;
const STORE_NAME = 'game_saves';
const SAVE_KEY = 'active_save';
const LOCAL_STORAGE_FALLBACK_KEY = 'imperiya_sich_save_v1';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists the entire GameState to IndexedDB and LocalStorage fallback.
 */
export async function saveGame(state: GameState): Promise<boolean> {
  const savePayload = {
    ...state,
    lastSavedTimestamp: Date.now(),
  };

  // Always mirror in localStorage for immediate fallback
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(savePayload));
  } catch (err) {
    console.warn('LocalStorage fallback write error:', err);
  }

  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(savePayload, SAVE_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.warn('IndexedDB put error:', request.error);
        resolve(true); // Still succeeded via localStorage
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, relied on localStorage:', err);
    return true;
  }
}

/**
 * Loads the active GameState from IndexedDB or LocalStorage.
 */
export async function loadGame(): Promise<GameState | null> {
  try {
    const db = await openIndexedDB();
    const data = await new Promise<any>((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(SAVE_KEY);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });

    if (data) {
      return migrateSave(data);
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB, trying localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return migrateSave(parsed);
    }
  } catch (err) {
    console.error('Failed to parse localStorage save:', err);
  }

  return null;
}

/**
 * Checks whether a save file exists in IndexedDB or LocalStorage.
 */
export async function hasSave(): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    const existsInIdb = await new Promise<boolean>((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(SAVE_KEY);

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => resolve(false);
    });
    if (existsInIdb) return true;
  } catch {
    // Continue to check localStorage
  }

  try {
    const item = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    return item !== null && item.length > 0;
  } catch {
    return false;
  }
}

/**
 * Clears the active save from both IndexedDB and LocalStorage.
 */
export async function deleteSave(): Promise<boolean> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_FALLBACK_KEY);
  } catch (err) {
    console.warn('LocalStorage remove error:', err);
  }

  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(SAVE_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return true;
  }
}
