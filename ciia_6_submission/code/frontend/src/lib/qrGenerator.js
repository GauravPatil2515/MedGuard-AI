/**
 * qrGenerator.js
 * QR Code generation for SAFE CAP+ medicine labels
 * Generates printable QR codes containing medicine information
 */

import QRCode from 'qrcode';

export const QR_VERSION = '1.0';

export function createMedicineQRData(medicine) {
  return {
    v: QR_VERSION,
    type: 'medicine',
    id: medicine.id || `med_${Date.now()}`,
    name: medicine.name,
    generic: medicine.generic,
    brand: medicine.brand,
    dosage: medicine.dosage,
    form: medicine.form,
    manufacturer: medicine.manufacturer,
    batchNumber: medicine.batchNumber,
    expiryDate: medicine.expiryDate,
    description: medicine.description,
    warnings: medicine.warnings,
    storage: medicine.storage,
    sideEffects: medicine.sideEffects,
    interactions: medicine.interactions || [],
    createdAt: new Date().toISOString()
  };
}

export async function generateQRCodeDataURL(qrData, options = {}) {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#0d382c',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  const dataString = JSON.stringify(qrData);
  
  try {
    const dataURL = await QRCode.toDataURL(dataString, mergedOptions);
    return dataURL;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw error;
  }
}

export async function generateQRCodeSVG(qrData, options = {}) {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#0d382c',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  const dataString = JSON.stringify(qrData);
  
  try {
    const svg = await QRCode.toString(dataString, { ...mergedOptions, type: 'svg' });
    return svg;
  } catch (error) {
    console.error('QR Code SVG generation failed:', error);
    throw error;
  }
}

export async function generatePrintableQRSheet(medicines, options = {}) {
  const qrCodes = [];
  
  for (const med of medicines) {
    const qrData = createMedicineQRData(med);
    const dataURL = await generateQRCodeDataURL(qrData, { width: 200 });
    qrCodes.push({
      medicine: med,
      qrDataURL: dataURL,
      qrData: qrData
    });
  }
  
  return qrCodes;
}

export function parseQRData(qrString) {
  try {
    const data = JSON.parse(qrString);
    
    // Validate version
    if (data.v !== QR_VERSION) {
      console.warn('QR Code version mismatch:', data.v);
    }
    
    if (data.type !== 'medicine') {
      console.warn('Not a medicine QR code:', data.type);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse QR data:', error);
    return null;
  }
}

export function formatMedicineForDisplay(qrData) {
  if (!qrData) return null;
  
  return {
    name: qrData.name || 'Unknown Medicine',
    generic: qrData.generic,
    brand: qrData.brand,
    dosage: qrData.dosage,
    form: qrData.form,
    manufacturer: qrData.manufacturer,
    batchNumber: qrData.batchNumber,
    expiryDate: qrData.expiryDate ? new Date(qrData.expiryDate).toLocaleDateString() : 'N/A',
    description: qrData.description,
    warnings: qrData.warnings,
    storage: qrData.storage,
    sideEffects: qrData.sideEffects,
    interactions: qrData.interactions || []
  };
}

// Get plain language description for medicine
export function getPlainLanguageDescription(medicine) {
  const descriptions = {
    'Warfarin': {
      en: 'Helps prevent blood clots and stroke.',
      mr: 'रक्तातील थांबणारी रुग्ण ठारपासून रोखण्यात मदत करते.',
      hi: 'रक्त को थपने और स्ट्रोक से बचाने में मदद करता है।'
    },
    'Glimepiride': {
      en: 'Helps your pancreas naturally release insulin after food.',
      mr: 'आहारानंतर तुमच्या अगरस्तीनमध्ये स्वाभाविकरित्या इन्सुलिन सोडवण्यात मदत करते.',
      hi: 'भोजन के बाद आपके पैंक्रिया को स्वाभाविक रूप से इंस्यूलिन छोड़ने में मदद करता है।'
    },
    'Amiodarone': {
      en: 'Treats serious heart rhythm problems.',
      mr: 'गंभीर हृदय धडकण समस्यांचा उपचार करते.',
      hi: 'गंभीर हृदय गति समस्याओं का उपचार करता है।'
    },
    'Pantoprazole': {
      en: 'Reduces stomach acid and protects your stomach lining.',
      mr: 'आयलेचे अम्ल कम करते आणि आयळरेखा सुस्तीचे संरक्षण करते.',
      hi: 'पेट के अम्ल को कम करता है और पेट की भित्ति की रक्षा करता है।'
    },
    'Metformin': {
      en: 'Lowers blood sugar - the first pill for diabetes.',
      mr: 'रक्त आकर्कर्षित करते - आयडी़याबिमासाठी पहिला गोळा.',
      hi: 'रक्त शर्करा कम करता है - डायाबिटीज का पहला गोला।'
    },
    'Combiflam': {
      en: 'Reduces pain and fever.',
      mr: 'वेदना आणि ताप सोडवते.',
      hi: 'दर्द और बुख घटाता है।'
    }
  };

  const medName = medicine.name || medicine.drugName || '';
  const lang = medicine.lang || 'en';
  const desc = descriptions[medName] || descriptions[medicine.generic];
  
  if (desc) {
    return desc[lang] || desc.en;
  }
  return medicine.description || 'No description available.';
}

// Get food timing instruction in plain language
export function getFoodInstruction(medicine, lang = 'en') {
  const instructions = {
    en: {
      breakfast: 'Take with breakfast',
      dinner: 'Take with dinner',
      lunch: 'Take with lunch',
      before: 'Take on empty stomach',
      after: 'Take after a meal',
      anytime: 'Take at any time'
    },
    mr: {
      breakfast: 'उंदाण्यानंतर घ्या',
      dinner: 'संध्याकाळी घ्या',
      lunch: 'दुपारी घ्या',
      before: 'आणखी भरलेले नाही',
      after: 'आहारानंतर घ्या',
      anytime: 'कोणत्याही वेळी घ्या'
    },
    hi: {
      breakfast: 'नाश्ते खाने के साथ ले',
      dinner: 'डिनर के साथ ले',
      lunch: 'लंच के साथ ले',
      before: '�ाल्पनी खाल्पने के साथ ले',
      after: 'भोजन के बाद ले',
      anytime: 'किसी भी समय ले'
    }
  };

  const medName = medicine.name || medicine.drugName || '';
  const timing = instructions[lang] || instructions.en;
  
  // Default food instructions based on known medicines
  const defaults = {
    'Warfarin': 'after',
    'Glimepiride': 'breakfast',
    'Amiodarone': 'after',
    'Pantoprazole': 'before',
    'Metformin': 'after',
    'Combiflam': 'after'
  };

  const defaultTiming = defaults[medName] || defaults[medicine.generic] || 'anytime';
  return timing[defaultTiming];
}