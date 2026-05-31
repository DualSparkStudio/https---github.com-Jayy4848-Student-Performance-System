import type { ModelData } from '../types/model';
import type { FactorScore, InstitutionSettings, PredictionResult, RiskLevel, StudentInput } from '../types';

const FEATURE_KEYS: (keyof StudentInput)[] = [
  'attendance',
  'previousGPA',
  'studyHoursPerWeek',
  'assignmentCompletion',
  'examScoreAvg',
  'participationScore',
  'sleepHours',
  'extracurricularHours',
  'parentalSupport',
];

const FEATURE_LABELS: Record<string, string> = {
  attendance: 'Attendance',
  previousGPA: 'Previous GPA',
  studyHoursPerWeek: 'Study Hours',
  assignmentCompletion: 'Assignment Completion',
  examScoreAvg: 'Exam Performance',
  participationScore: 'Class Participation',
  sleepHours: 'Sleep Quality',
  extracurricularHours: 'Extracurricular Balance',
  parentalSupport: 'Parental Support',
};

function extractFeatures(student: StudentInput): number[] {
  return FEATURE_KEYS.map((k) => student[k] as number);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRiskLevel(score: number, thresholds: Record<string, number>): RiskLevel {
  const order: RiskLevel[] = ['excellent', 'good', 'moderate', 'at-risk', 'critical'];
  for (const level of order) {
    if (score >= (thresholds[level] ?? 0)) return level;
  }
  return 'critical';
}

function percentToGpa(percent: number, scale: InstitutionSettings['gradingScale']): number {
  if (scale === 10) return Math.round((percent / 10) * 10) / 10;
  if (scale === 100) return Math.round(percent * 10) / 10;
  return Math.round((percent / 100) * 4 * 100) / 100;
}

function gpaToPercent(gpa: number, scale: InstitutionSettings['gradingScale']): number {
  if (scale === 10) return (gpa / 10) * 100;
  if (scale === 100) return gpa;
  return (gpa / 4) * 100;
}

function getTrend(
  student: StudentInput,
  predicted: number,
  gradingScale: InstitutionSettings['gradingScale'],
): 'improving' | 'stable' | 'declining' {
  const current = gpaToPercent(student.previousGPA, gradingScale);
  const diff = predicted - current;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function computeFactorScores(
  student: StudentInput,
  model: ModelData,
  normalized: number[],
): FactorScore[] {
  const { coefficients } = model.regression;
  const { mean } = model.scaler;

  return FEATURE_KEYS.map((key, i) => {
    const value = student[key] as number;
    const contribution = coefficients[i] * normalized[i];
    const belowMean = value < mean[i];

    let impact: FactorScore['impact'] = 'neutral';
    if (contribution > 0.5) impact = 'positive';
    else if (contribution < -0.5) impact = 'negative';
    else if (belowMean && coefficients[i] > 0) impact = 'negative';
    else if (!belowMean && coefficients[i] > 0) impact = 'positive';

    const score = clamp(50 + contribution * 3 + (value / (mean[i] || 1)) * 25, 0, 100);

    return {
      name: FEATURE_LABELS[key],
      value,
      weight: Math.abs(coefficients[i]) / coefficients.reduce((s, c) => s + Math.abs(c), 0),
      impact,
      score: Math.round(score * 10) / 10,
    };
  });
}

function generateRecommendations(
  student: StudentInput,
  factors: FactorScore[],
  model: ModelData,
): string[] {
  const recs: string[] = [];
  const { mean } = model.scaler;
  const priority = [...factors]
    .filter((f) => f.impact === 'negative' || f.score < 55)
    .sort((a, b) => a.score - b.score);

  for (const factor of priority.slice(0, 4)) {
    const idx = FEATURE_LABELS
      ? Object.entries(FEATURE_LABELS).find(([, label]) => label === factor.name)?.[0]
      : undefined;
    const key = idx as keyof StudentInput | undefined;
    const datasetMean = key ? mean[FEATURE_KEYS.indexOf(key)] : null;

    switch (factor.name) {
      case 'Attendance':
        recs.push(
          `Improve attendance (currently ${student.attendance}%). Validated model shows attendance correlates with final grades. Target 90%+.`,
        );
        break;
      case 'Previous GPA':
        recs.push(
          `Previous GPA (${student.previousGPA}) is the strongest validated predictor. Focus on consistent weekly review to maintain/improve trajectory.`,
        );
        break;
      case 'Study Hours':
        recs.push(
          student.studyHoursPerWeek < (datasetMean ?? 8)
            ? `Increase study time to at least ${Math.round(datasetMean ?? 8)} hours/week (dataset average for successful students).`
            : 'Maintain structured study schedule with regular breaks for retention.',
        );
        break;
      case 'Assignment Completion':
        recs.push(
          `Raise assignment completion from ${student.assignmentCompletion}% — past failures strongly predict lower final grades in validated data.`,
        );
        break;
      case 'Exam Performance':
        recs.push(
          `Exam scores (${student.examScoreAvg}%) are a key validated predictor. Schedule practice tests 2 weeks before exams.`,
        );
        break;
      case 'Class Participation':
        recs.push('Increase class engagement — participation correlates with improved outcomes in the training dataset.');
        break;
      case 'Sleep Quality':
        recs.push('Aim for 7–9 hours of sleep. Health indicators in the dataset link sleep quality to academic performance.');
        break;
      case 'Parental Support':
        recs.push('Strengthen family involvement — parental education and support are validated predictors in the research dataset.');
        break;
      default:
        recs.push(`Improve ${factor.name.toLowerCase()} — currently below expected levels for target performance.`);
    }
  }

  if (recs.length === 0) {
    recs.push('Student metrics align with high performers in the validated dataset. Maintain current approach.');
    recs.push('Continue monitoring each term and re-run prediction after mid-term assessments.');
  }

  return recs;
}

export function predictPerformance(
  student: StudentInput,
  model: ModelData,
  settings: InstitutionSettings,
): PredictionResult {
  const raw = extractFeatures(student);
  const normalized = raw.map((v, i) => (v - model.scaler.mean[i]) / model.scaler.std[i]);

  let predictedScore = model.regression.intercept;
  for (let i = 0; i < normalized.length; i++) {
    predictedScore += model.regression.coefficients[i] * normalized[i];
  }
  predictedScore = Math.round(clamp(predictedScore, 0, 100) * 10) / 10;

  const rmse = model.validation.holdoutTest.rmse;
  const mae = model.validation.holdoutTest.mae;
  const intervalLower = Math.round(clamp(predictedScore - rmse, 0, 100) * 10) / 10;
  const intervalUpper = Math.round(clamp(predictedScore + rmse, 0, 100) * 10) / 10;

  const confidence = Math.round(clamp(100 - mae * 2.5, 60, 95) * 10) / 10;

  const factorScores = computeFactorScores(student, model, normalized);
  const riskLevel = getRiskLevel(predictedScore, model.riskThresholds);

  return {
    predictedScore,
    predictedGPA: percentToGpa(predictedScore, settings.gradingScale),
    riskLevel,
    confidence,
    factorScores,
    recommendations: generateRecommendations(student, factorScores, model),
    trend: getTrend(student, predictedScore, settings.gradingScale),
    modelVersion: model.version,
    predictionInterval: { lower: intervalLower, upper: intervalUpper },
    expectedError: mae,
  };
}

export function getClassStats(students: Array<{ prediction: PredictionResult }>) {
  if (students.length === 0) {
    return { avgScore: 0, atRisk: 0, excellent: 0, total: 0 };
  }
  const scores = students.map((s) => s.prediction.predictedScore);
  const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  const atRisk = students.filter((s) => ['critical', 'at-risk'].includes(s.prediction.riskLevel)).length;
  const excellent = students.filter((s) => s.prediction.riskLevel === 'excellent').length;
  return { avgScore, atRisk, excellent, total: students.length };
}

export function getFeatureImportance(model: ModelData): Array<{ name: string; coefficient: number }> {
  return model.features.map((f, i) => ({
    name: FEATURE_LABELS[f] ?? f,
    coefficient: model.regression.coefficients[i],
  })).sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
}
