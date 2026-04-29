export interface Student {
  id: string;
  name: string;
  attendancePct: number;
  quizAvg: number;
  assignAvg: number;
  midtermScore: number;
  studyHoursPerWeek: number;
  onTimeSubmissionPct: number;
  lmsLoginsPerWeek: number;
  forumPosts: number;
  priorGPA: number;
  commuteTimeMin: number;
  gender: string;
}

export interface PredictionResult {
  riskScore: number; // 0 to 100
  atRisk: boolean;
  gradeBand: 'A' | 'B' | 'C' | 'D' | 'F';
  confidence: number;
  topFactors: string[];
  interventions: string[];
  explanation: string;
}

export interface AnalyticsSummary {
  totalStudents: number;
  atRiskCount: number;
  averageAttendance: number;
  averageGrade: number;
}
