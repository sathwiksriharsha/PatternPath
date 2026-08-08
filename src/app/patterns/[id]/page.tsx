"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProblemCard } from "@/components/ProblemCard";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function PatternDetailPage() {
  const params = useParams();
  const store = useStore();
  const patternId = params.id as string;

  if (!store.isLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-32" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      </AppShell>
    );
  }

  const pattern = store.data.patterns.find((p) => p.id === patternId);
  if (!pattern) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)]">Pattern not found.</p>
          <Link
            href="/patterns"
            className="text-sm text-[var(--accent-blue)] mt-2 inline-block"
          >
            ← Back to patterns
          </Link>
        </div>
      </AppShell>
    );
  }

  const problems = store.getPatternProblems(patternId);
  const progress = store.getPatternProgress(patternId);
  const avgConfidence =
    problems.filter((p) => p.confidence > 0).length > 0
      ? (
          problems.reduce((sum, p) => sum + p.confidence, 0) /
          problems.filter((p) => p.confidence > 0).length
        ).toFixed(1)
      : "—";
  const totalRevisions = problems.reduce((sum, p) => sum + p.revisionCount, 0);
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const medCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Back link */}
        <Link
          href="/patterns"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          All Patterns
        </Link>

        {/* Pattern header */}
        <div className="glass-card-static p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-[var(--accent-blue)] font-medium uppercase tracking-wider mb-1">
                {pattern.section}
              </p>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {pattern.name}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl leading-relaxed">
                {pattern.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 size={14} className="text-[var(--accent-green)]" />
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {progress.solved}/{progress.total}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                  Solved
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={14} className="text-[var(--accent-amber)]" />
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {avgConfidence}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                  Confidence
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <RotateCcw size={14} className="text-[var(--accent-purple)]" />
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {totalRevisions}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                  Revisions
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)]">
                Progress
              </span>
              <span className="text-xs font-mono text-[var(--text-tertiary)]">
                {progress.percentage}%
              </span>
            </div>
            <div className="progress-track h-2">
              <div
                className={cn(
                  "progress-fill h-full",
                  progress.percentage === 100
                    ? "bg-[var(--accent-green)]"
                    : "bg-[var(--accent-blue)]"
                )}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            {easyCount > 0 && (
              <span className="badge-easy px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {easyCount} Easy
              </span>
            )}
            {medCount > 0 && (
              <span className="badge-medium px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {medCount} Medium
              </span>
            )}
            {hardCount > 0 && (
              <span className="badge-hard px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {hardCount} Hard
              </span>
            )}
          </div>
        </div>

        {/* Problem list */}
        <section className="glass-card-static p-4">
          <div className="space-y-0.5">
            {problems.map((problem) => (
              <ProblemCard key={problem.number} problem={problem} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
