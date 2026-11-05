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
      const q = query(collection(dbInstance, 'businesses'), where('ownerUid', '==', uid));
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
      const payload = {
        businessId,
        ownerUid: uid,
        name: businessData.name || 'Mi Negocio BUSA',
        sector: businessData.sector || 'Tecnología',
        rif: businessData.rif || 'J-00000000-0',
        status: 'active',
        createdAt: new Date().toISOString(),
        ...businessData
      };
      await setDoc(ref, payload);
      return payload;
    } catch (err) {
      console.error('[BusinessRepository] Error registering business:', err);
      throw err;
    }
  }
};
