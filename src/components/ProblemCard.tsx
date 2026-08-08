"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Problem, ProblemStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  Check,
  Circle,
  AlertTriangle,
  X,
  ExternalLink,
  Star,
  RotateCcw,
} from "lucide-react";

interface ProblemCardProps {
  problem: Problem;
  showPattern?: boolean;
  compact?: boolean;
}

const statusConfig: Record<
  ProblemStatus,
  { icon: React.ElementType; label: string; class: string }
> = {
  not_started: {
    icon: Circle,
    label: "Not Started",
    class: "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
  },
  solved: {
    icon: Check,
    label: "Solved",
    class: "text-[var(--accent-green)]",
  },
  partial: {
    icon: AlertTriangle,
    label: "Partial",
    class: "text-[var(--accent-amber)]",
  },
  skipped: {
    icon: X,
    label: "Skipped",
    class: "text-[var(--accent-red)]",
  },
};

const difficultyClasses: Record<string, string> = {
  Easy: "badge-easy",
  Medium: "badge-medium",
  Hard: "badge-hard",
};

export function ProblemCard({
  problem,
  showPattern = false,
  compact = false,
}: ProblemCardProps) {
  const store = useStore();
  const status = statusConfig[problem.status];
  const StatusIcon = status.icon;

  const cycleStatus = () => {
    const order: ProblemStatus[] = [
      "not_started",
      "solved",
      "partial",
      "skipped",
    ];
    const currentIndex = order.indexOf(problem.status);
    const nextStatus = order[(currentIndex + 1) % order.length];
    store.updateProblemStatus(problem.number, nextStatus);
  };

  const handleConfidence = (rating: number) => {
    store.updateProblemConfidence(problem.number, rating);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 rounded-[var(--radius-md)]",
        "border border-transparent hover:border-[var(--glass-border)]",
        "hover:bg-[var(--glass-bg-hover)] transition-all duration-200",
        compact ? "py-2.5" : "py-3.5",
        problem.status === "solved" && "opacity-70"
      )}
    >
      {/* Status toggle */}
      <button
        onClick={cycleStatus}
        className={cn(
          "flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors",
          status.class
        )}
        title={`Status: ${status.label}. Click to cycle.`}
      >
        <StatusIcon size={compact ? 14 : 16} strokeWidth={2} />
      </button>

      {/* Problem number */}
      <span className="text-xs font-mono text-[var(--text-muted)] w-8 flex-shrink-0">
        #{problem.number}
      </span>

      {/* Title */}
      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex-1 text-sm font-medium truncate hover:text-[var(--accent-blue)] transition-colors",
          problem.status === "solved"
            ? "text-[var(--text-secondary)] line-through decoration-[var(--text-muted)]"
            : "text-[var(--text-primary)]"
        )}
      >
        {problem.title}
      </a>

      {/* Pattern tag */}
      {showPattern && (
        <span className="hidden lg:inline-block text-xs text-[var(--text-tertiary)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded-full truncate max-w-[140px]">
          {problem.pattern}
        </span>
      )}

      {/* Difficulty badge */}
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0",
          difficultyClasses[problem.difficulty]
        )}
      >
        {problem.difficulty}
      </span>

      {/* Confidence stars (show on hover or if rated) */}
      {!compact && (
        <div className="hidden md:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleConfidence(star)}
              className="p-0.5"
            >
              <Star
                size={12}
                className={cn(
                  "transition-colors",
                  star <= problem.confidence
                    ? "text-[var(--accent-amber)] fill-[var(--accent-amber)]"
                    : "text-[var(--text-muted)]"
                )}
              />
            </button>
          ))}
        </div>
      )}

      {/* Revision count */}
      {problem.revisionCount > 0 && (
        <div className="flex items-center gap-1 text-[var(--text-tertiary)]" title={`Revised ${problem.revisionCount} times`}>
          <RotateCcw size={12} />
          <span className="text-[10px] font-mono">{problem.revisionCount}</span>
        </div>
      )}

      {/* LeetCode link */}
      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors opacity-0 group-hover:opacity-100"
        title="Open on LeetCode"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
