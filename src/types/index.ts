export type InstitutionType = 'school' | 'college';

export type RiskLevel = 'critical' | 'at-risk' | 'moderate' | 'good' | 'excellent';

export interface StudentInput {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  institutionType: InstitutionType;
  attendance: number;
  previousGPA: number;
  studyHoursPerWeek: number;
  assignmentCompletion: number;
  examScoreAvg: number;
  participationScore: number;
  sleepHours: number;
  extracurricularHours: number;
  parentalSupport: number;
  createdAt: string;
}

export interface PredictionResult {
  predictedScore: number;
  predictedGPA: number;
  riskLevel: RiskLevel;
  confidence: number;
  factorScores: FactorScore[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
  modelVersion: string;
  predictionInterval: { lower: number; upper: number };
  expectedError: number;
}

export interface FactorScore {
  name: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
}

export interface InstitutionSettings {
  name: string;
  type: InstitutionType;
  gradingScale: 4 | 10 | 100;
}

export const DEFAULT_STUDENT: Omit<StudentInput, 'id' | 'createdAt'> = {
  name: '',
  rollNumber: '',
  grade: '',
  institutionType: 'school',
  attendance: 85,
  previousGPA: 3.2,
  studyHoursPerWeek: 15,
  assignmentCompletion: 80,
  examScoreAvg: 72,
  participationScore: 70,
  sleepHours: 7,
  extracurricularHours: 5,
  parentalSupport: 75,
};

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical Risk', color: 'text-red-400', bg: 'bg-red-500/20' },
  'at-risk': { label: 'At Risk', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  moderate: { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  good: { label: 'Good Standing', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  excellent: { label: 'Excellent', color: 'text-brand-300', bg: 'bg-brand-500/20' },
};

export const GRADE_OPTIONS = {
  school: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
  college: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate'],
};
