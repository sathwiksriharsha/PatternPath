"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProblemCard } from "@/components/ProblemCard";
import { useStore } from "@/lib/store";
import { formatDate, getDateForDay } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CheckCircle2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodayPage() {
  const store = useStore();
  const currentDay = store.isLoaded ? store.getScheduleDay() : 1;
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [activeTab, setActiveTab] = useState<"today" | "catchup">("today");

  if (!store.isLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-10 w-64" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      </AppShell>
    );
  }

  const problems = store.getDayProblems(selectedDay);
  const solvedCount = problems.filter((p) => p.status === "solved").length;
  const selectedDate = getDateForDay(store.settings.startDate, selectedDay);
  const isToday = selectedDay === currentDay;
  const totalDays = store.data.metadata.totalDays;

  // Get the pattern(s) for this day
  const patterns = [...new Set(problems.map((p) => p.pattern))];
  
  const catchUpProblems = store.getCatchUpProblems();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {isToday ? "Today's Problems" : "Daily Problems"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {patterns.join(" · ")}
            </p>
          </div>

          {/* Day navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
              disabled={selectedDay <= 1}
              className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-center min-w-[140px]">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Day {selectedDay}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {formatDate(selectedDate)}
              </p>
            </div>

            <button
              onClick={() =>
                setSelectedDay(Math.min(totalDays, selectedDay + 1))
              }
              disabled={selectedDay >= totalDays}
              className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Tabs (Only show on Today's view) */}
        {isToday && (
          <div className="flex items-center gap-4 mb-2 border-b border-[var(--glass-border)] pb-2">
            <button
              onClick={() => setActiveTab("today")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeTab === "today"
                  ? "bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("catchup")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeTab === "catchup"
                  ? "bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              Catch-up ({catchUpProblems.length})
            </button>
          </div>
        )}

        {/* Jump to today */}
        {!isToday && (
          <button
            onClick={() => {
              setSelectedDay(currentDay);
              setActiveTab("today");
            }}
            className="text-xs text-[var(--accent-blue)] hover:underline"
          >
            ← Jump to today (Day {currentDay})
          </button>
        )}

        {/* --- TODAY TAB CONTENT --- */}
        {(activeTab === "today" || !isToday) && (
          <>
            {/* Progress indicator */}
        <div className="glass-card-static p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[var(--accent-blue)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Daily Progress
              </span>
            </div>
            <span className="text-sm font-mono text-[var(--text-secondary)]">
              {solvedCount}/{problems.length}
            </span>
          </div>
          <div className="progress-track h-2">
            <div
              className={cn(
                "progress-fill h-full",
                solvedCount === problems.length && problems.length > 0
                  ? "bg-[var(--accent-green)]"
                  : "bg-[var(--accent-blue)]"
              )}
              style={{
                width: `${
                  problems.length > 0
                    ? Math.round((solvedCount / problems.length) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
          {solvedCount === problems.length && problems.length > 0 && (
            <div className="flex items-center gap-2 mt-3 text-[var(--accent-green)]">
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">
                All problems completed for this day!
              </span>
            </div>
          )}
        </div>

        {/* Problem list */}
        <div className="glass-card-static p-4 space-y-0.5">
          <div className="flex items-center gap-2 mb-3 px-2">
            <CalendarCheck size={16} className="text-[var(--text-secondary)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Scheduled for Day {selectedDay}
            </h2>
          </div>
          {problems.length > 0 ? (
            problems.map((problem) => (
              <ProblemCard key={problem.number} problem={problem} showPattern />
            ))
          ) : (
            <div className="py-12 text-center">
              <CalendarCheck
                size={32}
                className="mx-auto text-[var(--text-muted)] mb-3"
              />
              <p className="text-sm text-[var(--text-secondary)]">
                No problems scheduled for Day {selectedDay}.
              </p>
            </div>
          )}
        </div>
        </>
        )}

        {/* --- CATCH-UP TAB CONTENT --- */}
        {activeTab === "catchup" && isToday && (
          <div className="glass-card-static p-4 space-y-0.5">
            {catchUpProblems.length > 0 ? (
              catchUpProblems.map((problem) => (
                <ProblemCard key={problem.number} problem={problem} showPattern />
              ))
            ) : (
              <div className="py-12 text-center">
                <CheckCircle2
                  size={32}
                  className="mx-auto text-[var(--accent-green)] mb-3"
                />
                <p className="text-sm text-[var(--text-secondary)]">
                  You are all caught up! Amazing work.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick nav */}
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <span>
            Day 1: {formatDate(getDateForDay(store.settings.startDate, 1))}
          </span>
          <span>
            Day {totalDays}:{" "}
            {formatDate(getDateForDay(store.settings.startDate, totalDays))}
          </span>
        </div>
      </div>
    </AppShell>
  );
}
