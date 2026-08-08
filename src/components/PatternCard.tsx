"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Pattern } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface PatternCardProps {
  pattern: Pattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const store = useStore();
  const prog = store.getPatternProgress(pattern.id);

  const statusLabel =
    prog.solved === 0
      ? "Not Started"
      : prog.solved === prog.total
      ? "Complete"
      : "In Progress";

  const statusColor =
    prog.solved === 0
      ? "text-[var(--text-tertiary)]"
      : prog.solved === prog.total
      ? "text-[var(--accent-green)]"
      : "text-[var(--accent-blue)]";

  const statusDot =
    prog.solved === 0
      ? "bg-[var(--text-muted)]"
      : prog.solved === prog.total
      ? "bg-[var(--accent-green)]"
      : "bg-[var(--accent-blue)]";

  // Count difficulty distribution
  const problems = store.getPatternProblems(pattern.id);
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const medCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <Link href={`/patterns/${pattern.id}`}>
      <div className="glass-card p-5 h-full flex flex-col group cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-blue)] transition-colors">
              {pattern.name}
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {pattern.section}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors mt-0.5 flex-shrink-0"
          />
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2 flex-1">
          {pattern.description}
        </p>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", statusDot)} />
              <span className={cn("text-[11px] font-medium", statusColor)}>
                {statusLabel}
              </span>
            </div>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {prog.solved}/{prog.total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-track">
            <div
              className={cn(
                "progress-fill",
                prog.solved === prog.total && prog.total > 0
                  ? "bg-[var(--accent-green)]"
                  : "bg-[var(--accent-blue)]"
              )}
              style={{ width: `${prog.percentage}%` }}
            />
          </div>

          {/* Difficulty distribution */}
          <div className="flex items-center gap-3 text-[10px]">
            {easyCount > 0 && (
              <span className="text-[var(--easy)]">
                {easyCount} Easy
              </span>
            )}
            {medCount > 0 && (
              <span className="text-[var(--medium)]">
                {medCount} Med
              </span>
            )}
            {hardCount > 0 && (
              <span className="text-[var(--hard)]">
                {hardCount} Hard
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
