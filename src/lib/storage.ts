import type { InstitutionSettings, StudentInput } from '../types';

const STUDENTS_KEY = 'edupredict_students';
const SETTINGS_KEY = 'edupredict_settings';

export interface StoredStudent extends StudentInput {
  prediction: import('../types').PredictionResult;
}

export function loadStudents(): StoredStudent[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudents(students: StoredStudent[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function loadSettings(): InstitutionSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? JSON.parse(raw)
      : { name: 'My Institution', type: 'school', gradingScale: 4 };
  } catch {
    return { name: 'My Institution', type: 'school', gradingScale: 4 };
  }
}

export function saveSettings(settings: InstitutionSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportStudents(students: StoredStudent[]): void {
  const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `edupredict-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importStudents(file: File): Promise<StoredStudent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        resolve(data);
      } catch {
        reject(new Error('Could not parse file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

export function generateId(): string {
  return crypto.randomUUID();
}
