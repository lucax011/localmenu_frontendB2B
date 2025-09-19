import axios from 'axios';
import Constants from 'expo-constants';

const OCR_BASE = (Constants?.expoConfig?.extra as any)?.ocrBaseUrl || 'http://localhost:8000';

export type OCRItem = {
  name: string;
  price: number;
  description?: string;
  confidence?: number;
  bbox?: number[];
};

export const extractFromImage = async (file: any) => {
  const formData = new FormData();
  // file is expected to be { uri, name, type }
  formData.append('file', file as any);
  const { data } = await axios.post(`${OCR_BASE}/ocr/extract`, formData as any, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 1000 * 60,
  });
  return data as { items: OCRItem[] };
};
