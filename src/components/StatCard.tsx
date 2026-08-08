"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  className,
}: StatCardProps) {
  const glowClass = {
    blue: "stat-glow-blue",
    green: "stat-glow-green",
    amber: "stat-glow-amber",
    purple: "stat-glow-purple",
  }[color];

  const iconColor = {
    blue: "text-[var(--accent-blue)]",
    green: "text-[var(--accent-green)]",
    amber: "text-[var(--accent-amber)]",
    purple: "text-[var(--accent-purple)]",
  }[color];

  const iconBg = {
    blue: "bg-[var(--accent-blue-dim)]",
    green: "bg-[var(--accent-green-dim)]",
    amber: "bg-[var(--accent-amber-dim)]",
    purple: "bg-[var(--accent-purple-dim)]",
  }[color];

  return (
    <div
      className={cn(
        "glass-card-static p-5",
        glowClass,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center",
            iconBg
          )}
        >
          <Icon size={20} className={iconColor} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
