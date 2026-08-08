"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { PatternCard } from "@/components/PatternCard";
import { useStore } from "@/lib/store";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  "All",
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Binary Search",
  "Trees",
  "Heaps & Priority Queues",
  "Graphs",
  "Dynamic Programming",
  "Backtracking",
  "Greedy Algorithms",
  "Hashing, Math & Bit Manipulation",
  "System Design & Data Structure Design",
];

export default function PatternsPage() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("All");

  const filteredPatterns = useMemo(() => {
    return store.data.patterns.filter((pattern) => {
      const matchesSearch =
        search === "" ||
        pattern.name.toLowerCase().includes(search.toLowerCase()) ||
        pattern.description.toLowerCase().includes(search.toLowerCase());
      const matchesSection =
        activeSection === "All" || pattern.section === activeSection;
      return matchesSearch && matchesSection;
    });
  }, [store.data.patterns, search, activeSection]);

  if (!store.isLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="skeleton h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="skeleton h-[200px]" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const stats = store.getOverallStats();

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Patterns
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {stats.patternsCompleted} of {stats.totalPatterns} patterns
              mastered
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              placeholder="Search patterns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
            />
          </div>
        </div>

        {/* Section filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <Filter size={14} className="text-[var(--text-muted)] flex-shrink-0" />
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200",
                activeSection === section
                  ? "bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20"
                  : "text-[var(--text-secondary)] bg-[var(--glass-bg)] border border-transparent hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Pattern grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>

        {filteredPatterns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--text-tertiary)]">
              No patterns found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
