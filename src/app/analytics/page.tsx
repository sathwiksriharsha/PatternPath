"use client";

import React, { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Heatmap } from "@/components/Heatmap";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const CHART_COLORS = {
  blue: "hsl(217, 91%, 60%)",
  green: "hsl(142, 71%, 45%)",
  amber: "hsl(38, 92%, 50%)",
  red: "hsl(0, 72%, 51%)",
  purple: "hsl(262, 83%, 58%)",
  cyan: "hsl(190, 90%, 50%)",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-md)] px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-[var(--text-primary)]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-[var(--text-secondary)]">
          {entry.name}: <span className="font-mono">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function AnalyticsPage() {
  const store = useStore();

  const stats = store.isLoaded ? store.getOverallStats() : null;
  const heatmapData = store.isLoaded ? store.getHeatmapData() : [];

  // ── Pattern completion data ─────────────────────────────────────────────
  const patternData = useMemo(() => {
    if (!store.isLoaded) return [];
    return store.data.patterns.map((pattern) => {
      const prog = store.getPatternProgress(pattern.id);
      return {
        name:
          pattern.name.length > 18
            ? pattern.name.substring(0, 18) + "…"
            : pattern.name,
        fullName: pattern.name,
        solved: prog.solved,
        total: prog.total,
        percentage: prog.percentage,
        remaining: prog.total - prog.solved,
      };
    });
  }, [store]);

  // ── Weak patterns (lowest % solved, at least 1 attempted) ───────────────
  const weakPatterns = useMemo(() => {
    return [...patternData]
      .filter((p) => p.solved > 0 && p.percentage < 100)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 8);
  }, [patternData]);

  // ── Strong patterns (highest %) ─────────────────────────────────────────
  const strongPatterns = useMemo(() => {
    return [...patternData]
      .filter((p) => p.solved > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);
  }, [patternData]);

  // ── Difficulty distribution (donut) ─────────────────────────────────────
  const difficultyData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Easy", value: stats.easySolved, total: stats.easyTotal, color: CHART_COLORS.green },
      { name: "Medium", value: stats.mediumSolved, total: stats.mediumTotal, color: CHART_COLORS.amber },
      { name: "Hard", value: stats.hardSolved, total: stats.hardTotal, color: CHART_COLORS.red },
    ];
  }, [stats]);

  // ── Section progress ────────────────────────────────────────────────────
  const sectionData = useMemo(() => {
    if (!store.isLoaded) return [];
    const sections = new Map<string, { solved: number; total: number }>();
    store.data.patterns.forEach((pattern) => {
      const prog = store.getPatternProgress(pattern.id);
      const existing = sections.get(pattern.section) || {
        solved: 0,
        total: 0,
      };
      sections.set(pattern.section, {
        solved: existing.solved + prog.solved,
        total: existing.total + prog.total,
      });
    });
    return Array.from(sections.entries()).map(([name, data]) => ({
      name: name.length > 16 ? name.substring(0, 16) + "…" : name,
      fullName: name,
      solved: data.solved,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0,
    }));
  }, [store]);

  if (!store.isLoaded || !stats) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-[300px]" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track your progress, identify weak areas, and stay consistent.
          </p>
        </div>

        {/* Top stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card-static p-4 text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {stats.totalSolved}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Problems Solved
            </p>
          </div>
          <div className="glass-card-static p-4 text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {Math.round((stats.totalSolved / stats.totalProblems) * 100)}%
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Overall Completion
            </p>
          </div>
          <div className="glass-card-static p-4 text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {stats.patternsCompleted}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Patterns Mastered
            </p>
          </div>
          <div className="glass-card-static p-4 text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {store.getCurrentStreak()}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Day Streak
            </p>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Distribution (Donut) */}
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-[var(--accent-blue)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Difficulty Distribution
              </h2>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              {difficultyData.map((d) => (
                <span key={d.name} className="text-[var(--text-secondary)]">
                  {d.name}:{" "}
                  <span className="font-mono">
                    {d.value}/{d.total}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Section Progress */}
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[var(--accent-green)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Section Progress
              </h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    width={130}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="percentage"
                    name="Completion"
                    fill={CHART_COLORS.blue}
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weak Patterns */}
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-[var(--accent-amber)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Weak Patterns
              </h2>
            </div>
            {weakPatterns.length > 0 ? (
              <div className="space-y-3">
                {weakPatterns.map((pattern) => (
                  <div key={pattern.name} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] truncate">
                        {pattern.fullName}
                      </p>
                      <div className="progress-track mt-1">
                        <div
                          className="progress-fill bg-[var(--accent-amber)]"
                          style={{ width: `${pattern.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-tertiary)] w-12 text-right">
                      {pattern.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                Start solving problems to see weak areas
              </p>
            )}
          </div>

          {/* Strong Patterns */}
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-[var(--accent-green)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Strong Patterns
              </h2>
            </div>
            {strongPatterns.length > 0 ? (
              <div className="space-y-3">
                {strongPatterns.map((pattern) => (
                  <div key={pattern.name} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] truncate">
                        {pattern.fullName}
                      </p>
                      <div className="progress-track mt-1">
                        <div
                          className={cn(
                            "progress-fill",
                            pattern.percentage === 100
                              ? "bg-[var(--accent-green)]"
                              : "bg-[var(--accent-blue)]"
                          )}
                          style={{ width: `${pattern.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-tertiary)] w-12 text-right">
                      {pattern.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                Start solving problems to track strengths
              </p>
            )}
          </div>
        </div>

        {/* Consistency Heatmap (full width) */}
        <div className="glass-card-static p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-[var(--accent-green)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Consistency Heatmap
            </h2>
          </div>
          <Heatmap data={heatmapData} startDate={store.settings.startDate} />
        </div>
      </div>
    </AppShell>
  );
}
