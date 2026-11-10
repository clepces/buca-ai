import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { initFirebase } from '@/core/config/firebase.js';

const getDb = () => {
  const { db } = initFirebase();
  if (!db) throw new Error('[ProfileService] Firestore no disponible.');
  return db;
};

export const ProfileService = {
  async getProfile(uid) {
    if (!uid) return null;
    try {
      const ref = doc(getDb(), 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (err) {
      console.error('[ProfileService] Error fetching profile:', err);
      return null;
    }
  },

  async updateProfile(uid, data) {
    if (!uid) throw new Error('UID is required');
    try {
      const ref = doc(getDb(), 'users', uid);
      await updateDoc(ref, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('[ProfileService] Error updating profile:', err);
      throw err;
    }
  },

  async createProfile(uid, data) {
    if (!uid) throw new Error('UID is required');
    try {
      const ref = doc(getDb(), 'users', uid);
      const payload = {
        uid,
        email: data.email || '',
        displayName: data.displayName || 'Operador BUSA',
        role: data.role || 'operator',
        level: data.level || 1,
        createdAt: new Date().toISOString(),
        ...data
      };
      await setDoc(ref, payload, { merge: true });
      return payload;
    } catch (err) {
      console.error('[ProfileService] Error creating profile:', err);
      throw err;
    }
  }
};
