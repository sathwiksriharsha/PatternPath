/* ═══════════════════════════════════════════════════════════════════════════
   PatternPath — Type Definitions
   ═══════════════════════════════════════════════════════════════════════════ */

export type Difficulty = "Easy" | "Medium" | "Hard";
export type PriorityGroup = "Core" | "Advanced" | "Optional" | "System Design";
export type ProblemStatus = "not_started" | "solved" | "partial" | "skipped";

export interface Problem {
  number: number;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  patternId: string;
  section: string;
  priorityGroup: PriorityGroup;
  leetcodeUrl: string;
  scheduleDay: number;
  // User progress (stored in localStorage)
  status: ProblemStatus;
  confidence: number; // 0-5
  revisionCount: number;
  notes: string;
  solvedAt: string | null;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  section: string;
  icon: string;
  problemCount: number;
  problems: number[];
  orderIndex: number;
}

export interface ScheduleDay {
  day: number;
  date: string | null;
  problems: number[];
}

export interface DataMetadata {
  totalProblems: number;
  totalPatterns: number;
  totalDays: number;
  startDate: string;
  problemsPerDay: number;
  priorityBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

export interface ProblemData {
  metadata: DataMetadata;
  patterns: Pattern[];
  problems: Problem[];
  schedule: ScheduleDay[];
}

export interface Contest {
  id: string;
  platform: "LeetCode" | "Codeforces" | "CodeChef" | "Other";
  name: string;
  date: string;
  rank: number | null;
  ratingBefore: number | null;
  ratingAfter: number | null;
  problemsSolved: number;
  problemsAttempted: number;
  notes: string;
}

export interface UserSettings {
  name: string;
  dailyGoal: number;
  startDate: string;
  theme: "dark" | "light" | "system";
}

export interface DailyLog {
  date: string;
  problemsCompleted: number;
}
