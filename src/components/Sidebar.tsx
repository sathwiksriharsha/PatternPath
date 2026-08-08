"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  Layers,
  CalendarCheck,
  BarChart3,
  Trophy,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patterns", label: "Patterns", icon: Layers },
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const store = useStore();
  const streak = store.isLoaded ? store.getCurrentStreak() : 0;
  const stats = store.isLoaded ? store.getOverallStats() : null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-out",
        "border-r border-[var(--glass-border)]",
        "bg-[var(--bg-primary)]",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[var(--glass-border)]">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                PatternPath
              </h1>
              <p className="text-[10px] text-[var(--text-tertiary)] leading-none">
                Master DSA
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-link",
                isActive && "active",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.8} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Streak & Stats */}
      {!collapsed && store.isLoaded && (
        <div className="px-3 pb-4 space-y-3 animate-fade-in">
          {/* Streak */}
          <div className="glass-card-static p-3">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Streak
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {streak}{" "}
              <span className="text-xs font-normal text-[var(--text-tertiary)]">
                days
              </span>
            </p>
          </div>

          {/* Progress */}
          {stats && (
            <div className="glass-card-static p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">
                  Overall
                </span>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">
                  {stats.totalSolved}/{stats.totalProblems}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill bg-[var(--accent-blue)]"
                  style={{
                    width: `${Math.round(
                      (stats.totalSolved / stats.totalProblems) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-center h-10 mx-3 mb-3",
          "rounded-[var(--radius-md)] text-[var(--text-tertiary)]",
          "hover:text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)]",
          "transition-all duration-200"
        )}
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    </aside>
  );
}
