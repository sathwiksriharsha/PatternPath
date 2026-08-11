"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-root)]">
      {/* Background mesh */}
      <div className="bg-mesh" />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 md:hidden h-14 bg-[var(--bg-primary)] border-b border-[var(--glass-border)] flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
            PatternPath
          </span>
        </div>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300 ease-out min-h-screen",
          // Desktop: offset by sidebar width
          sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[260px]",
          // Mobile: no sidebar offset, but add top padding for the mobile header
          "ml-0 pt-14 md:pt-0"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
