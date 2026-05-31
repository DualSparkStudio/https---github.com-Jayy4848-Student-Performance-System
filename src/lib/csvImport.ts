import type { InstitutionSettings, StudentInput } from '../types';
import { predictPerformance } from './predictor';
import { generateId, type StoredStudent } from './storage';
import type { ModelData } from '../types/model';

const CSV_COLUMNS = [
  'name',
  'rollNumber',
  'grade',
  'institutionType',
  'attendance',
  'previousGPA',
  'studyHoursPerWeek',
  'assignmentCompletion',
  'examScoreAvg',
  'participationScore',
  'sleepHours',
  'extracurricularHours',
  'parentalSupport',
] as const;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function toNumber(value: string, fallback: number): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseStudentsCsv(
  content: string,
  model: ModelData,
  settings: InstitutionSettings,
): StoredStudent[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one student');

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ''));
  const students: StoredStudent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => !v)) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });

    const name = row.name || row.studentname || row.fullname;
    if (!name) continue;

    const student: StudentInput = {
      id: generateId(),
      name,
      rollNumber: row.rollnumber || row.id || row.roll || '',
      grade: row.grade || row.year || '',
      institutionType: (row.institutiontype || settings.type) === 'college' ? 'college' : 'school',
      attendance: toNumber(row.attendance, 85),
      previousGPA: toNumber(row.previousgpa || row.gpa, 3.0),
      studyHoursPerWeek: toNumber(row.studyhoursperweek || row.studyhours, 10),
      assignmentCompletion: toNumber(row.assignmentcompletion || row.assignments, 80),
      examScoreAvg: toNumber(row.examscoreavg || row.examscore || row.exams, 70),
      participationScore: toNumber(row.participationscore || row.participation, 70),
      sleepHours: toNumber(row.sleephours || row.sleep, 7),
      extracurricularHours: toNumber(row.extracurricularhours || row.extracurricular, 5),
      parentalSupport: toNumber(row.parentalsupport || row.parental, 70),
      createdAt: new Date().toISOString(),
    };

    students.push({
      ...student,
      prediction: predictPerformance(student, model, settings),
    });
  }

  if (students.length === 0) throw new Error('No valid student rows found in CSV');
  return students;
}

export const CSV_TEMPLATE = CSV_COLUMNS.join(',');

export const CSV_EXAMPLE = `${CSV_TEMPLATE}
John Smith,STU-001,Grade 10,school,92,3.4,12,88,75,80,7.5,4,78
Maria Garcia,STU-002,Year 2,college,78,2.8,18,70,65,60,6,6,65`;
