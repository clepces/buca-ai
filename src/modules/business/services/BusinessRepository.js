import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { initFirebase } from '@/core/config/firebase.js';

const getDb = () => {
  const { db } = initFirebase();
  if (!db) throw new Error('Firestore DB no inicializada.');
  return db;
};

export const BusinessRepository = {
  async getBusinessesForUser(uid) {
    if (!uid) return [];
    try {
      const dbInstance = getDb();
      const q = query(collection(dbInstance, 'businesses'), where('owner_id', '==', uid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.error('[BusinessRepository] Error fetching businesses:', err);
      return [];
    }
  },

  async registerBusiness(uid, businessData) {
    if (!uid) throw new Error('Owner UID required');
    try {
      const dbInstance = getDb();
      const businessId = 'biz_' + Date.now();
      const ref = doc(dbInstance, 'businesses', businessId);
      // Sanitize input data to prevent overwriting critical identity fields
      const { businessId: _ignoredId, owner_id: _ignoredOwner, ownerUid: _ignoredOwnerUid, createdAt: _ignoredCreated, ...safeData } = businessData || {};
      const payload = {
        ...safeData,
        businessId,
        owner_id: uid,
        ownerUid: uid, // Compatibilidad retroactiva
        name: safeData.name || 'Mi Negocio BUCA',
        sector: safeData.sector || 'Tecnología',
        rif: safeData.rif || 'J-00000000-0',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await setDoc(ref, payload);
      return payload;
    } catch (err) {
      console.error('[BusinessRepository] Error registering business:', err);
      throw err;
    }
  }
};
