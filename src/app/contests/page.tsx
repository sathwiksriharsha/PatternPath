"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Contest } from "@/lib/types";
import {
  Trophy,
  Plus,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const PLATFORMS = ["LeetCode", "Codeforces", "CodeChef", "Other"] as const;

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

export default function ContestsPage() {
  const store = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: "LeetCode" as Contest["platform"],
    name: "",
    date: new Date().toISOString().split("T")[0],
    rank: "",
    ratingBefore: "",
    ratingAfter: "",
    problemsSolved: "",
    problemsAttempted: "",
    notes: "",
  });

  if (!store.isLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-[300px]" />
        </div>
      </AppShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addContest({
      id: Date.now().toString(),
      platform: form.platform,
      name: form.name,
      date: form.date,
      rank: form.rank ? parseInt(form.rank) : null,
      ratingBefore: form.ratingBefore ? parseInt(form.ratingBefore) : null,
      ratingAfter: form.ratingAfter ? parseInt(form.ratingAfter) : null,
      problemsSolved: parseInt(form.problemsSolved) || 0,
      problemsAttempted: parseInt(form.problemsAttempted) || 0,
      notes: form.notes,
    });
    setShowForm(false);
    setForm({
      platform: "LeetCode",
      name: "",
      date: new Date().toISOString().split("T")[0],
      rank: "",
      ratingBefore: "",
      ratingAfter: "",
      problemsSolved: "",
      problemsAttempted: "",
      notes: "",
    });
  };

  // Rating graph data
  const ratingData = store.contests
    .filter((c) => c.ratingAfter !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => ({
      date: c.date,
      rating: c.ratingAfter,
      platform: c.platform,
      name: c.name,
    }));

  const sortedContests = [...store.contests].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const inputClass =
    "w-full px-3 py-2 text-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Contest Tracker
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Track your competitive programming journey
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all",
              showForm
                ? "bg-[var(--accent-red-dim)] text-[var(--accent-red)]"
                : "bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20"
            )}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add Contest"}
          </button>
        </div>

        {/* Add Contest Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="glass-card-static p-6 space-y-4 animate-slide-up"
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              New Contest Entry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Platform
                </label>
                <select
                  value={form.platform}
                  onChange={(e) =>
                    setForm({ ...form, platform: e.target.value as Contest["platform"] })
                  }
                  className={inputClass}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Contest Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Weekly Contest 390"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Rank
                </label>
                <input
                  type="number"
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  placeholder="1500"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Rating Before
                </label>
                <input
                  type="number"
                  value={form.ratingBefore}
                  onChange={(e) =>
                    setForm({ ...form, ratingBefore: e.target.value })
                  }
                  placeholder="1600"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Rating After
                </label>
                <input
                  type="number"
                  value={form.ratingAfter}
                  onChange={(e) =>
                    setForm({ ...form, ratingAfter: e.target.value })
                  }
                  placeholder="1650"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Problems Solved
                </label>
                <input
                  type="number"
                  value={form.problemsSolved}
                  onChange={(e) =>
                    setForm({ ...form, problemsSolved: e.target.value })
                  }
                  placeholder="3"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Problems Attempted
                </label>
                <input
                  type="number"
                  value={form.problemsAttempted}
                  onChange={(e) =>
                    setForm({ ...form, problemsAttempted: e.target.value })
                  }
                  placeholder="4"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Struggled with Q4 — need to practice segment trees..."
                className={cn(inputClass, "h-20 resize-none")}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium bg-[var(--accent-blue)] text-white rounded-[var(--radius-md)] hover:brightness-110 transition-all"
            >
              Save Contest
            </button>
          </form>
        )}

        {/* Rating Graph */}
        {ratingData.length > 1 && (
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-[var(--accent-amber)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Rating Progression
              </h2>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    domain={["dataMin - 50", "dataMax + 50"]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    name="Rating"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Contest History Table */}
        <div className="glass-card-static overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--glass-border)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Contest History
            </h2>
          </div>
          {sortedContests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Contest
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Solved
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContests.map((contest) => {
                    const ratingChange =
                      contest.ratingAfter && contest.ratingBefore
                        ? contest.ratingAfter - contest.ratingBefore
                        : null;
                    return (
                      <tr
                        key={contest.id}
                        className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors"
                      >
                        <td className="px-6 py-3">
                          <span className="text-xs font-medium text-[var(--accent-blue)] bg-[var(--accent-blue-dim)] px-2 py-0.5 rounded-full">
                            {contest.platform}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[var(--text-primary)]">
                          {contest.name}
                        </td>
                        <td className="px-6 py-3 text-[var(--text-secondary)]">
                          {contest.date}
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-[var(--text-primary)]">
                          {contest.rank ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-mono text-[var(--text-primary)]">
                            {contest.ratingAfter ?? "—"}
                          </span>
                          {ratingChange !== null && (
                            <span
                              className={cn(
                                "ml-1 text-xs",
                                ratingChange > 0
                                  ? "text-[var(--accent-green)]"
                                  : ratingChange < 0
                                  ? "text-[var(--accent-red)]"
                                  : "text-[var(--text-muted)]"
                              )}
                            >
                              ({ratingChange > 0 ? "+" : ""}
                              {ratingChange})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-[var(--text-secondary)]">
                          {contest.problemsSolved}/{contest.problemsAttempted}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => store.removeContest(contest.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Trophy
                size={32}
                className="mx-auto text-[var(--text-muted)] mb-3"
              />
              <p className="text-sm text-[var(--text-tertiary)]">
                No contests recorded yet. Add your first contest above.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
