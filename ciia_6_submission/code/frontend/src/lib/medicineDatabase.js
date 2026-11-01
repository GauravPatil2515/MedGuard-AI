/**
 * medicineDatabase.js
 * Local IndexedDB storage for medicine information and QR codes
 * Used by Admin to store scanned medicine data and generate printable QR codes
 */

const DB_NAME = 'SAFECAP_MedicineDB';
const DB_VERSION = 1;
const MEDICINE_STORE = 'medicines';
const QR_STORE = 'qr_codes';

let dbPromise = null;

function initDB() {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Medicine store
      if (!db.objectStoreNames.contains(MEDICINE_STORE)) {
        const medStore = db.createObjectStore(MEDICINE_STORE, { keyPath: 'id', autoIncrement: true });
        medStore.createIndex('name', 'name', { unique: false });
        medStore.createIndex('generic', 'generic', { unique: false });
        medStore.createIndex('batchNumber', 'batchNumber', { unique: false });
        medStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      // QR Code store
      if (!db.objectStoreNames.contains(QR_STORE)) {
        const qrStore = db.createObjectStore(QR_STORE, { keyPath: 'id', autoIncrement: true });
        qrStore.createIndex('medicineId', 'medicineId', { unique: false });
        qrStore.createIndex('qrData', 'qrData', { unique: false });
        qrStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
  
  return dbPromise;
}

export async function saveMedicine(medicine) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDICINE_STORE, 'readwrite');
    const store = tx.objectStore(MEDICINE_STORE);
    const data = {
      ...medicine,
      createdAt: medicine.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getMedicine(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDICINE_STORE, 'readonly');
    const store = tx.objectStore(MEDICINE_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllMedicines() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDICINE_STORE, 'readonly');
    const store = tx.objectStore(MEDICINE_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function searchMedicines(query) {
  const medicines = await getAllMedicines();
  const lowerQuery = query.toLowerCase();
  return medicines.filter(m => 
    m.name?.toLowerCase().includes(lowerQuery) ||
    m.generic?.toLowerCase().includes(lowerQuery) ||
    m.brand?.toLowerCase().includes(lowerQuery)
  );
}

export async function deleteMedicine(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDICINE_STORE, 'readwrite');
    const store = tx.objectStore(MEDICINE_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// QR Code storage
export async function saveQRCode(qrData) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QR_STORE, 'readwrite');
    const store = tx.objectStore(QR_STORE);
    const data = {
      ...qrData,
      createdAt: qrData.createdAt || new Date().toISOString()
    };
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getQRCodesByMedicine(medicineId) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QR_STORE, 'readonly');
    const store = tx.objectStore(QR_STORE);
    const index = store.index('medicineId');
    const request = index.getAll(medicineId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllQRCodes() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QR_STORE, 'readonly');
    const store = tx.objectStore(QR_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Initialize with sample medicines for demo
export async function seedDemoMedicines() {
  const existing = await getAllMedicines();
  if (existing.length > 0) return;
  
  const demoMeds = [
    {
      name: 'Warfarin',
      generic: 'Warfarin Sodium',
      brand: 'Coumadin',
      dosage: '5mg',
      form: 'Tablet',
      manufacturer: 'Bristol-Myers Squibb',
      batchNumber: 'WFN2026001',
      expiryDate: '2027-12-31',
      description: 'Anticoagulant (blood thinner) used to prevent blood clots',
      warnings: 'Do not take with NSAIDs like ibuprofen. Regular INR monitoring required.',
      storage: 'Store below 25°C. Keep in original container.',
      sideEffects: 'Bleeding, bruising, nausea',
      interactions: ['Amiodarone', 'Aspirin', 'Ibuprofen', 'Antibiotics']
    },
    {
      name: 'Glimepiride',
      generic: 'Glimepiride',
      brand: 'Amaryl',
      dosage: '2mg',
      form: 'Tablet',
      manufacturer: 'Sanofi',
      batchNumber: 'GLM2026001',
      expiryDate: '2027-10-15',
      description: 'Diabetes medication that helps pancreas release insulin',
      warnings: 'Take with breakfast. Monitor blood sugar. Risk of hypoglycemia.',
      storage: 'Store at room temperature. Keep dry.',
      sideEffects: 'Low blood sugar, dizziness, headache',
      interactions: ['Beta-blockers', 'Steroids', 'Diuretics']
    },
    {
      name: 'Amiodarone',
      generic: 'Amiodarone Hydrochloride',
      brand: 'Cordarone',
      dosage: '200mg',
      form: 'Tablet',
      manufacturer: 'Sanofi',
      batchNumber: 'AMD2026001',
      expiryDate: '2027-08-20',
      description: 'Anti-arrhythmic for irregular heartbeats',
      warnings: 'Take with food. Regular thyroid, liver, lung checks needed.',
      storage: 'Store below 30°C. Protect from light.',
      sideEffects: 'Thyroid issues, lung problems, skin discoloration',
      interactions: ['Warfarin', 'Digoxin', 'Simvastatin']
    },
    {
      name: 'Pantoprazole',
      generic: 'Pantoprazole Sodium',
      brand: 'Protonix',
      dosage: '40mg',
      form: 'Tablet',
      manufacturer: 'Pfizer',
      batchNumber: 'PNT2026001',
      expiryDate: '2027-11-30',
      description: 'Reduces stomach acid - protects stomach lining',
      warnings: 'Take 30 mins before breakfast. Long-term use needs doctor review.',
      storage: 'Store at room temperature.',
      sideEffects: 'Headache, diarrhea, nausea',
      interactions: ['Warfarin', 'Methotrexate', 'HIV medications']
    },
    {
      name: 'Metformin',
      generic: 'Metformin Hydrochloride',
      brand: 'Glucophage',
      dosage: '500mg',
      form: 'Tablet',
      manufacturer: 'Merck',
      batchNumber: 'MET2026001',
      expiryDate: '2027-09-15',
      description: 'First-line diabetes medication - improves insulin sensitivity',
      warnings: 'Take with meals to reduce stomach upset. Monitor kidney function.',
      storage: 'Store at room temperature. Keep dry.',
      sideEffects: 'Stomach upset, diarrhea, metallic taste',
      interactions: ['Contrast dye', 'Cimetidine', 'Diuretics']
    }
  ];
  
  for (const med of demoMeds) {
    await saveMedicine(med);
  }
}