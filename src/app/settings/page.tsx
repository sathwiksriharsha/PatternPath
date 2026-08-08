"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  User,
  Calendar,
  Target,
  Palette,
  Download,
  RotateCcw,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const store = useStore();

  if (!store.isLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-10 w-48" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-[100px]" />
          ))}
        </div>
      </AppShell>
    );
  }

  const inputClass =
    "w-full px-3 py-2 text-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors";

  const handleExport = () => {
    const data = {
      settings: store.settings,
      progress: store.progress,
      contests: store.contests,
      dailyLogs: store.dailyLogs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patternpath-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      localStorage.removeItem("patternpath_progress");
      localStorage.removeItem("patternpath_contests");
      localStorage.removeItem("patternpath_daily_logs");
      window.location.reload();
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure your PatternPath experience
          </p>
        </div>

        {/* Profile */}
        <section className="glass-card-static p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-[var(--accent-blue)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Profile
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Display Name
              </label>
              <input
                type="text"
                value={store.settings.name}
                onChange={(e) => store.updateSettings({ name: e.target.value })}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="glass-card-static p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} className="text-[var(--accent-green)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Schedule
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={store.settings.startDate}
                onChange={(e) =>
                  store.updateSettings({ startDate: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Daily Goal (problems)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={store.settings.dailyGoal}
                onChange={(e) =>
                  store.updateSettings({
                    dailyGoal: parseInt(e.target.value) || 5,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="glass-card-static p-6">
          <div className="flex items-center gap-2 mb-5">
            <Download size={16} className="text-[var(--accent-purple)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Data Management
            </h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-[var(--radius-md)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-colors"
            >
              <Download size={16} className="text-[var(--accent-blue)]" />
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Download all progress as JSON
                </p>
              </div>
            </button>
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-[var(--radius-md)] bg-[var(--accent-red-dim)] border border-[hsla(0,72%,51%,0.15)] text-[var(--accent-red)] hover:brightness-110 transition-all"
            >
              <RotateCcw size={16} />
              <div>
                <p className="font-medium">Reset All Progress</p>
                <p className="text-xs opacity-70">
                  This action cannot be undone
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="glass-card-static p-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              PatternPath
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Master DSA. One Pattern at a Time.
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-3">
              507 problems · 47 patterns · 102 days
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
