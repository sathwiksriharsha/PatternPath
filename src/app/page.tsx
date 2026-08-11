"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ProblemCard } from "@/components/ProblemCard";
import { Heatmap } from "@/components/Heatmap";
import { useStore } from "@/lib/store";
import { formatDate, getDateForDay } from "@/lib/utils";
import {
  Flame,
  CheckCircle2,
  Target,
  Layers,
  BookOpen,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const store = useStore();

  if (!store.isLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-[120px]" />
            ))}
          </div>
          <div className="skeleton h-[300px]" />
          <div className="skeleton h-[200px]" />
        </div>
      </AppShell>
    );
  }

  const stats = store.getOverallStats();
  const streak = store.getCurrentStreak();
  const currentPattern = store.getCurrentPattern();
  const todayProblems = store.getTodayProblems();
  const heatmapData = store.getHeatmapData();
  const scheduleDay = store.getScheduleDay();
  const todaySolved = todayProblems.filter(
    (p) => p.status === "solved"
  ).length;
  const todayDate = getDateForDay(store.settings.startDate, scheduleDay);

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Day {scheduleDay} of {store.data.metadata.totalDays} ·{" "}
            {formatDate(todayDate)}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard
            title="Current Streak"
            value={streak}
            subtitle={`day${streak !== 1 ? "s" : ""}`}
            icon={Flame}
            color="amber"
          />
          <StatCard
            title="Overall Progress"
            value={`${stats.totalSolved}/${stats.totalProblems}`}
            subtitle={`${Math.round(
              (stats.totalSolved / stats.totalProblems) * 100
            )}% complete`}
            icon={CheckCircle2}
            color="blue"
          />
          <StatCard
            title="Today's Goal"
            value={`${todaySolved}/${store.settings.dailyGoal}`}
            subtitle={
              todaySolved >= store.settings.dailyGoal
                ? "Goal reached!"
                : `${store.settings.dailyGoal - todaySolved} remaining`
            }
            icon={Target}
            color="green"
          />
          <StatCard
            title="Current Pattern"
            value={currentPattern?.name?.split("/")[0]?.split("(")[0]?.trim() || "—"}
            subtitle={
              currentPattern
                ? `${
                    store.getPatternProgress(currentPattern.id).solved
                  }/${
                    store.getPatternProgress(currentPattern.id).total
                  } solved`
                : ""
            }
            icon={Layers}
            color="purple"
          />
        </div>

        {/* Today's Problems */}
        <section className="glass-card-static p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen
                size={18}
                className="text-[var(--accent-blue)]"
                strokeWidth={1.8}
              />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Today&apos;s Problems
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-tertiary)]">
              Day {scheduleDay}
            </span>
          </div>
          <div className="space-y-0.5">
            {todayProblems.length > 0 ? (
              todayProblems.map((problem) => (
                <ProblemCard
                  key={problem.number}
                  problem={problem}
                  showPattern
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <Zap
                  size={24}
                  className="mx-auto text-[var(--text-muted)] mb-2"
                />
                <p className="text-sm text-[var(--text-tertiary)]">
                  {scheduleDay < 1
                    ? "Your journey begins on " +
                      formatDate(
                        new Date(store.settings.startDate + "T00:00:00")
                      )
                    : "No problems scheduled for today"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Heatmap */}
        <section className="glass-card-static p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame
              size={18}
              className="text-[var(--accent-green)]"
              strokeWidth={1.8}
            />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Consistency
            </h2>
          </div>
          <Heatmap data={heatmapData} startDate={store.settings.startDate} />
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card-static p-4 text-center">
            <p className="text-2xl font-bold text-[var(--easy)]">
              {stats.easySolved}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                /{stats.easyTotal}
              </span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Easy</p>
          </div>
          <div className="glass-card-static p-4 text-center">
            <p className="text-2xl font-bold text-[var(--medium)]">
              {stats.mediumSolved}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                /{stats.mediumTotal}
              </span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Medium</p>
          </div>
          <div className="glass-card-static p-4 text-center">
            <p className="text-2xl font-bold text-[var(--hard)]">
              {stats.hardSolved}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                /{stats.hardTotal}
              </span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Hard</p>
          </div>
          <div className="glass-card-static p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent-purple)]">
              {stats.patternsCompleted}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                /{stats.totalPatterns}
              </span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Patterns</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
