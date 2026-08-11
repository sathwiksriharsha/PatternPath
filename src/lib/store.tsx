"use client";
/* ═══════════════════════════════════════════════════════════════════════════
   PatternPath — State Management (localStorage-backed React Context)
   ═══════════════════════════════════════════════════════════════════════════ */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type {
  Problem,
  ProblemStatus,
  Contest,
  UserSettings,
  DailyLog,
  ProblemData,
  Pattern,
} from "./types";
import rawData from "@/data/problems.json";
import { getLocalDateString } from "@/lib/utils";

// ── Storage keys ────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  PROGRESS: "patternpath_progress",
  CONTESTS: "patternpath_contests",
  SETTINGS: "patternpath_settings",
  DAILY_LOGS: "patternpath_daily_logs",
} as const;

// ── Default settings ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: UserSettings = {
  name: "User",
  dailyGoal: 5,
  startDate: "2026-10-01",
  theme: "dark",
};

// ── Types ───────────────────────────────────────────────────────────────────
interface ProgressMap {
  [problemNumber: number]: {
    status: ProblemStatus;
    confidence: number;
    revisionCount: number;
    notes: string;
    solvedAt: string | null;
  };
}

interface StoreState {
  data: ProblemData;
  progress: ProgressMap;
  contests: Contest[];
  settings: UserSettings;
  dailyLogs: DailyLog[];
  isLoaded: boolean;
}

interface StoreActions {
  updateProblemStatus: (problemNumber: number, status: ProblemStatus) => void;
  updateProblemConfidence: (problemNumber: number, confidence: number) => void;
  updateProblemNotes: (problemNumber: number, notes: string) => void;
  incrementRevision: (problemNumber: number) => void;
  addContest: (contest: Contest) => void;
  removeContest: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  getProblemProgress: (problemNumber: number) => Problem;
  getPatternProblems: (patternId: string) => Problem[];
  getPatternProgress: (patternId: string) => {
    solved: number;
    total: number;
    percentage: number;
  };
  getTodayProblems: () => Problem[];
  getDayProblems: (day: number) => Problem[];
  getCatchUpProblems: () => Problem[];
  getCurrentStreak: () => number;
  getOverallStats: () => {
    totalSolved: number;
    totalProblems: number;
    easySolved: number;
    easyTotal: number;
    mediumSolved: number;
    mediumTotal: number;
    hardSolved: number;
    hardTotal: number;
    patternsCompleted: number;
    totalPatterns: number;
  };
  getCurrentPattern: () => Pattern | null;
  getScheduleDay: () => number;
  getHeatmapData: () => DailyLog[];
}

type Store = StoreState & StoreActions;

const StoreContext = createContext<Store | null>(null);

// ── Helpers ─────────────────────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// ── Provider ────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const data = rawData as unknown as ProblemData;

  const [progress, setProgress] = useState<ProgressMap>({});
  const [contests, setContests] = useState<Contest[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadFromStorage(STORAGE_KEYS.PROGRESS, {}));
    setContests(loadFromStorage(STORAGE_KEYS.CONTESTS, []));
    setSettings(
      loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    );
    setDailyLogs(loadFromStorage(STORAGE_KEYS.DAILY_LOGS, []));
    setIsLoaded(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (isLoaded) saveToStorage(STORAGE_KEYS.PROGRESS, progress);
  }, [progress, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveToStorage(STORAGE_KEYS.CONTESTS, contests);
  }, [contests, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveToStorage(STORAGE_KEYS.DAILY_LOGS, dailyLogs);
  }, [dailyLogs, isLoaded]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const updateProblemStatus = useCallback(
    (problemNumber: number, status: ProblemStatus) => {
      setProgress((prev) => {
        const existing = prev[problemNumber] || {
          status: "not_started",
          confidence: 0,
          revisionCount: 0,
          notes: "",
          solvedAt: null,
        };
        const wasSolved = existing.status === "solved";
        const nowSolved = status === "solved";

        const updated = {
          ...prev,
          [problemNumber]: {
            ...existing,
            status,
            solvedAt: nowSolved
              ? getLocalDateString()
              : nowSolved
              ? existing.solvedAt
              : null,
          },
        };

        // Update daily log based on the actual change
        if (wasSolved !== nowSolved) {
          const today = getLocalDateString();
          setDailyLogs((prevLogs) => {
            const existingLog = prevLogs.find((l) => l.date === today);

            if (nowSolved) {
              // Marking as solved: increment
              if (!existingLog) {
                return [...prevLogs, { date: today, problemsCompleted: 1 }];
              }
              return prevLogs.map((l) =>
                l.date === today
                  ? { ...l, problemsCompleted: l.problemsCompleted + 1 }
                  : l
              );
            } else {
              // Unmarking from solved: decrement (but never below 0)
              if (existingLog) {
                const newCount = Math.max(0, existingLog.problemsCompleted - 1);
                if (newCount === 0) {
                  return prevLogs.filter((l) => l.date !== today);
                }
                return prevLogs.map((l) =>
                  l.date === today
                    ? { ...l, problemsCompleted: newCount }
                    : l
                );
              }
              return prevLogs;
            }
          });
        }

        return updated;
      });
    },
    []
  );

  const updateProblemConfidence = useCallback(
    (problemNumber: number, confidence: number) => {
      setProgress((prev) => ({
        ...prev,
        [problemNumber]: {
          ...(prev[problemNumber] || {
            status: "not_started",
            confidence: 0,
            revisionCount: 0,
            notes: "",
            solvedAt: null,
          }),
          confidence,
        },
      }));
    },
    []
  );

  const updateProblemNotes = useCallback(
    (problemNumber: number, notes: string) => {
      setProgress((prev) => ({
        ...prev,
        [problemNumber]: {
          ...(prev[problemNumber] || {
            status: "not_started",
            confidence: 0,
            revisionCount: 0,
            notes: "",
            solvedAt: null,
          }),
          notes,
        },
      }));
    },
    []
  );

  const incrementRevision = useCallback((problemNumber: number) => {
    setProgress((prev) => ({
      ...prev,
      [problemNumber]: {
        ...(prev[problemNumber] || {
          status: "not_started",
          confidence: 0,
          revisionCount: 0,
          notes: "",
          solvedAt: null,
        }),
        revisionCount:
          ((prev[problemNumber]?.revisionCount || 0) + 1),
      },
    }));
  }, []);

  const addContest = useCallback((contest: Contest) => {
    setContests((prev) => [...prev, contest]);
  }, []);

  const removeContest = useCallback((id: string) => {
    setContests((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  // ── Computed ────────────────────────────────────────────────────────────
  const getProblemProgress = useCallback(
    (problemNumber: number): Problem => {
      const problem = data.problems.find((p) => p.number === problemNumber);
      const prog = progress[problemNumber];
      if (!problem) throw new Error(`Problem ${problemNumber} not found`);
      return {
        ...problem,
        status: prog?.status || "not_started",
        confidence: prog?.confidence || 0,
        revisionCount: prog?.revisionCount || 0,
        notes: prog?.notes || "",
        solvedAt: prog?.solvedAt || null,
      };
    },
    [data.problems, progress]
  );

  const getPatternProblems = useCallback(
    (patternId: string): Problem[] => {
      return data.problems
        .filter((p) => p.patternId === patternId)
        .map((p) => ({
          ...p,
          status: progress[p.number]?.status || "not_started",
          confidence: progress[p.number]?.confidence || 0,
          revisionCount: progress[p.number]?.revisionCount || 0,
          notes: progress[p.number]?.notes || "",
          solvedAt: progress[p.number]?.solvedAt || null,
        }));
    },
    [data.problems, progress]
  );

  const getPatternProgress = useCallback(
    (patternId: string) => {
      const problems = data.problems.filter((p) => p.patternId === patternId);
      const solved = problems.filter(
        (p) => progress[p.number]?.status === "solved"
      ).length;
      return {
        solved,
        total: problems.length,
        percentage: problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0,
      };
    },
    [data.problems, progress]
  );

  const getScheduleDay = useCallback((): number => {
    const start = new Date(settings.startDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil(data.problems.length / settings.dailyGoal);
    return Math.max(1, Math.min(diffDays + 1, totalDays));
  }, [settings.startDate, data.problems.length, settings.dailyGoal]);

  const getDayProblems = useCallback(
    (day: number): Problem[] => {
      const startIndex = (day - 1) * settings.dailyGoal;
      const endIndex = startIndex + settings.dailyGoal;
      
      return data.problems.slice(startIndex, endIndex).map((problem) => ({
        ...problem,
        status: progress[problem.number]?.status || "not_started",
        confidence: progress[problem.number]?.confidence || 0,
        revisionCount: progress[problem.number]?.revisionCount || 0,
        notes: progress[problem.number]?.notes || "",
        solvedAt: progress[problem.number]?.solvedAt || null,
      }));
    },
    [data.problems, progress, settings.dailyGoal]
  );

  const getCatchUpProblems = useCallback((): Problem[] => {
    const currentDay = getScheduleDay();
    if (currentDay <= 1) return [];
    
    // Get all problems up to yesterday
    const endIndex = (currentDay - 1) * settings.dailyGoal;
    return data.problems
      .slice(0, endIndex)
      .map((problem) => ({
        ...problem,
        status: progress[problem.number]?.status || "not_started",
        confidence: progress[problem.number]?.confidence || 0,
        revisionCount: progress[problem.number]?.revisionCount || 0,
        notes: progress[problem.number]?.notes || "",
        solvedAt: progress[problem.number]?.solvedAt || null,
      }))
      .filter((p) => p.status !== "solved");
  }, [data.problems, progress, settings.dailyGoal, getScheduleDay]);

  const getTodayProblems = useCallback((): Problem[] => {
    const day = getScheduleDay();
    return getDayProblems(day);
  }, [getScheduleDay, getDayProblems]);

  const getCurrentStreak = useCallback((): number => {
    // Build a set of dates with activity for O(1) lookup
    const activeDates = new Set<string>();
    
    // Add dates from dailyLogs
    dailyLogs.forEach((l) => {
      if (l.problemsCompleted > 0) activeDates.add(l.date);
    });

    // Add dates from actual problem progress (more robust)
    Object.values(progress).forEach((p) => {
      if (p.status === "solved" && p.solvedAt) {
        // Fallback for old UTC strings vs new local date strings
        const dateStr = p.solvedAt.includes("T") 
          ? p.solvedAt.split("T")[0] 
          : p.solvedAt;
        activeDates.add(dateStr);
      }
    });

    if (activeDates.size === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    // Check if today has activity — if not, start checking from yesterday
    const startOffset = activeDates.has(todayStr) ? 0 : 1;

    for (let i = startOffset; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = getLocalDateString(checkDate);

      if (activeDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [dailyLogs]);

  const getOverallStats = useCallback(() => {
    const problems = data.problems;
    const totalSolved = problems.filter(
      (p) => progress[p.number]?.status === "solved"
    ).length;
    const easySolved = problems.filter(
      (p) => p.difficulty === "Easy" && progress[p.number]?.status === "solved"
    ).length;
    const mediumSolved = problems.filter(
      (p) => p.difficulty === "Medium" && progress[p.number]?.status === "solved"
    ).length;
    const hardSolved = problems.filter(
      (p) => p.difficulty === "Hard" && progress[p.number]?.status === "solved"
    ).length;
    const patternsCompleted = data.patterns.filter((pat) => {
      const patProblems = problems.filter((p) => p.patternId === pat.id);
      return (
        patProblems.length > 0 &&
        patProblems.every((p) => progress[p.number]?.status === "solved")
      );
    }).length;

    return {
      totalSolved,
      totalProblems: problems.length,
      easySolved,
      easyTotal: problems.filter((p) => p.difficulty === "Easy").length,
      mediumSolved,
      mediumTotal: problems.filter((p) => p.difficulty === "Medium").length,
      hardSolved,
      hardTotal: problems.filter((p) => p.difficulty === "Hard").length,
      patternsCompleted,
      totalPatterns: data.patterns.length,
    };
  }, [data.problems, data.patterns, progress]);

  const getCurrentPattern = useCallback((): Pattern | null => {
    // Find the first pattern that isn't fully solved
    for (const pattern of data.patterns) {
      const patternProblems = data.problems.filter(
        (p) => p.patternId === pattern.id
      );
      const allSolved = patternProblems.every(
        (p) => progress[p.number]?.status === "solved"
      );
      if (!allSolved) return pattern;
    }
    return data.patterns[data.patterns.length - 1] || null;
  }, [data.patterns, data.problems, progress]);

  const getHeatmapData = useCallback((): DailyLog[] => {
    // Build heatmap from progress solvedAt dates (source of truth)
    const dateMap = new Map<string, number>();

    // Count problems solved per date from actual progress
    Object.values(progress).forEach((p) => {
      if (p.status === "solved" && p.solvedAt) {
        // solvedAt is already formatted as YYYY-MM-DD now thanks to the previous fix,
        // but we'll support both old and new formats safely
        const date = p.solvedAt.split("T")[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });

    // Merge with dailyLogs for dates that might not have solvedAt
    dailyLogs.forEach((log) => {
      if (!dateMap.has(log.date) && log.problemsCompleted > 0) {
        dateMap.set(log.date, log.problemsCompleted);
      }
    });

    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      problemsCompleted: count,
    }));
  }, [progress, dailyLogs]);

  // ── Store ───────────────────────────────────────────────────────────────
  const store: Store = useMemo(
    () => ({
      data,
      progress,
      contests,
      settings,
      dailyLogs,
      isLoaded,
      updateProblemStatus,
      updateProblemConfidence,
      updateProblemNotes,
      incrementRevision,
      addContest,
      removeContest,
      updateSettings,
      getProblemProgress,
      getPatternProblems,
      getPatternProgress,
      getTodayProblems,
      getDayProblems,
      getCatchUpProblems,
      getCurrentStreak,
      getOverallStats,
      getCurrentPattern,
      getScheduleDay,
      getHeatmapData,
    }),
    [
      data,
      progress,
      contests,
      settings,
      dailyLogs,
      isLoaded,
      updateProblemStatus,
      updateProblemConfidence,
      updateProblemNotes,
      incrementRevision,
      addContest,
      removeContest,
      updateSettings,
      getProblemProgress,
      getPatternProblems,
      getPatternProgress,
      getTodayProblems,
      getDayProblems,
      getCatchUpProblems,
      getCurrentStreak,
      getOverallStats,
      getCurrentPattern,
      getScheduleDay,
      getHeatmapData,
    ]
  );

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
