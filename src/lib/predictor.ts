import type { FactorScore, InstitutionType, PredictionResult, RiskLevel, StudentInput } from '../types';

interface WeightConfig {
  attendance: number;
  previousGPA: number;
  studyHours: number;
  assignmentCompletion: number;
  examScore: number;
  participation: number;
  sleep: number;
  extracurricular: number;
  parentalSupport: number;
}

const WEIGHTS: Record<InstitutionType, WeightConfig> = {
  school: {
    attendance: 0.18,
    previousGPA: 0.15,
    studyHours: 0.12,
    assignmentCompletion: 0.14,
    examScore: 0.16,
    participation: 0.08,
    sleep: 0.07,
    extracurricular: 0.04,
    parentalSupport: 0.06,
  },
  college: {
    attendance: 0.12,
    previousGPA: 0.2,
    studyHours: 0.18,
    assignmentCompletion: 0.15,
    examScore: 0.18,
    participation: 0.06,
    sleep: 0.05,
    extracurricular: 0.03,
    parentalSupport: 0.03,
  },
};

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function scoreSleep(hours: number): number {
  if (hours >= 7 && hours <= 9) return 100;
  if (hours >= 6 && hours <= 10) return 75;
  if (hours >= 5 && hours <= 11) return 50;
  return 25;
}

function scoreStudyHours(hours: number, type: InstitutionType): number {
  const optimal = type === 'college' ? 20 : 15;
  const diff = Math.abs(hours - optimal);
  if (diff <= 3) return 100;
  if (diff <= 7) return 75;
  if (diff <= 12) return 50;
  return 30;
}

function scoreExtracurricular(hours: number, type: InstitutionType): number {
  const optimal = type === 'college' ? 8 : 5;
  if (hours >= optimal * 0.5 && hours <= optimal * 1.5) return 100;
  if (hours <= optimal * 2.5) return 70;
  return 40;
}

function gpaToPercent(gpa: number, type: InstitutionType): number {
  const maxGpa = type === 'college' ? 4 : 4;
  return (gpa / maxGpa) * 100;
}

function percentToGpa(percent: number, type: InstitutionType): number {
  const maxGpa = type === 'college' ? 4 : 4;
  return Math.round((percent / 100) * maxGpa * 100) / 100;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'moderate';
  if (score >= 40) return 'at-risk';
  return 'critical';
}

function getTrend(student: StudentInput, predicted: number): 'improving' | 'stable' | 'declining' {
  const current = gpaToPercent(student.previousGPA, student.institutionType);
  const diff = predicted - current;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function generateRecommendations(student: StudentInput, factors: FactorScore[]): string[] {
  const recs: string[] = [];
  const lowFactors = factors.filter((f) => f.score < 60).sort((a, b) => a.score - b.score);

  for (const factor of lowFactors.slice(0, 4)) {
    switch (factor.name) {
      case 'Attendance':
        recs.push(`Improve attendance — currently at ${student.attendance}%. Target 90%+ for better outcomes.`);
        break;
      case 'Study Hours':
        recs.push(
          student.studyHoursPerWeek < 10
            ? 'Increase weekly study time to at least 15–20 hours with structured sessions.'
            : 'Balance study hours — over-studying without rest can reduce retention.',
        );
        break;
      case 'Assignment Completion':
        recs.push('Focus on completing all assignments on time — this strongly correlates with exam success.');
        break;
      case 'Exam Performance':
        recs.push('Schedule regular practice tests and review sessions before major exams.');
        break;
      case 'Class Participation':
        recs.push('Engage more actively in class discussions and group activities.');
        break;
      case 'Sleep Quality':
        recs.push('Aim for 7–9 hours of sleep nightly to improve memory and focus.');
        break;
      case 'Parental Support':
        recs.push('Increase family engagement — regular check-ins boost academic motivation.');
        break;
      case 'Extracurricular Balance':
        recs.push('Maintain a healthy balance between academics and extracurricular activities.');
        break;
      default:
        break;
    }
  }

  if (recs.length === 0) {
    recs.push('Maintain current study habits and continue regular self-assessment.');
    recs.push('Consider mentoring peers — teaching reinforces your own learning.');
  }

  return recs;
}

export function predictPerformance(student: StudentInput): PredictionResult {
  const w = WEIGHTS[student.institutionType];

  const factorScores: FactorScore[] = [
    {
      name: 'Attendance',
      value: student.attendance,
      weight: w.attendance,
      impact: student.attendance >= 85 ? 'positive' : student.attendance >= 70 ? 'neutral' : 'negative',
      score: normalize(student.attendance, 0, 100),
    },
    {
      name: 'Previous GPA',
      value: student.previousGPA,
      weight: w.previousGPA,
      impact: student.previousGPA >= 3 ? 'positive' : student.previousGPA >= 2.5 ? 'neutral' : 'negative',
      score: gpaToPercent(student.previousGPA, student.institutionType),
    },
    {
      name: 'Study Hours',
      value: student.studyHoursPerWeek,
      weight: w.studyHours,
      impact: 'neutral',
      score: scoreStudyHours(student.studyHoursPerWeek, student.institutionType),
    },
    {
      name: 'Assignment Completion',
      value: student.assignmentCompletion,
      weight: w.assignmentCompletion,
      impact: student.assignmentCompletion >= 80 ? 'positive' : 'negative',
      score: normalize(student.assignmentCompletion, 0, 100),
    },
    {
      name: 'Exam Performance',
      value: student.examScoreAvg,
      weight: w.examScore,
      impact: student.examScoreAvg >= 70 ? 'positive' : 'negative',
      score: normalize(student.examScoreAvg, 0, 100),
    },
    {
      name: 'Class Participation',
      value: student.participationScore,
      weight: w.participation,
      impact: student.participationScore >= 70 ? 'positive' : 'neutral',
      score: normalize(student.participationScore, 0, 100),
    },
    {
      name: 'Sleep Quality',
      value: student.sleepHours,
      weight: w.sleep,
      impact: student.sleepHours >= 7 && student.sleepHours <= 9 ? 'positive' : 'negative',
      score: scoreSleep(student.sleepHours),
    },
    {
      name: 'Extracurricular Balance',
      value: student.extracurricularHours,
      weight: w.extracurricular,
      impact: 'neutral',
      score: scoreExtracurricular(student.extracurricularHours, student.institutionType),
    },
    {
      name: 'Parental Support',
      value: student.parentalSupport,
      weight: w.parentalSupport,
      impact: student.parentalSupport >= 70 ? 'positive' : 'neutral',
      score: normalize(student.parentalSupport, 0, 100),
    },
  ];

  const weightedScore = factorScores.reduce((sum, f) => sum + f.score * f.weight, 0);
  const predictedScore = Math.round(weightedScore * 10) / 10;
  const predictedGPA = percentToGpa(predictedScore, student.institutionType);
  const riskLevel = getRiskLevel(predictedScore);

  const variance = factorScores.reduce((sum, f) => sum + Math.abs(f.score - 70) * f.weight, 0);
  const confidence = Math.round(Math.min(95, 70 + variance * 0.3) * 10) / 10;

  return {
    predictedScore,
    predictedGPA,
    riskLevel,
    confidence,
    factorScores,
    recommendations: generateRecommendations(student, factorScores),
    trend: getTrend(student, predictedScore),
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
