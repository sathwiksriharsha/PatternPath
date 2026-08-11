"use client";

import React, { useMemo } from "react";
import { cn, getLocalDateString } from "@/lib/utils";
import type { DailyLog } from "@/lib/types";

interface HeatmapProps {
  data: DailyLog[];
  startDate: string;
  className?: string;
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEKS = 26; // ~6 months
const DAYS_PER_WEEK = 7;
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getIntensity(count: number): string {
  if (count === 0) return "rgba(255,255,255,0.03)";
  if (count === 1) return "hsla(142, 71%, 45%, 0.2)";
  if (count === 2) return "hsla(142, 71%, 45%, 0.35)";
  if (count === 3) return "hsla(142, 71%, 45%, 0.5)";
  if (count === 4) return "hsla(142, 71%, 45%, 0.7)";
  return "hsla(142, 71%, 45%, 0.9)";
}

export function Heatmap({ data, startDate, className }: HeatmapProps) {
  const cells = useMemo(() => {
    const dataMap = new Map<string, number>();
    data.forEach((d) => dataMap.set(d.date, d.problemsCompleted));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from WEEKS weeks ago, aligned to Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * 7) + 1);
    // Align to the nearest Sunday going back
    start.setDate(start.getDate() - start.getDay());

    const cells: Array<{
      date: string;
      count: number;
      x: number;
      y: number;
      month: number;
    }> = [];

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < DAYS_PER_WEEK; day++) {
        const date = new Date(start);
        date.setDate(start.getDate() + week * 7 + day);

        if (date > today) continue;

        const dateStr = getLocalDateString(date);
        const count = dataMap.get(dateStr) || 0;

        cells.push({
          date: dateStr,
          y: day * (CELL_SIZE + CELL_GAP),
          month: date.getMonth(),
        });
      }
    }

    return cells;
  }, [data]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; x: number }> = [];
    let lastMonth = -1;

    cells.forEach((cell) => {
      if (cell.y === 0 && cell.month !== lastMonth) {
        labels.push({
          label: MONTH_LABELS[cell.month],
          x: cell.x,
        });
        lastMonth = cell.month;
      }
    });

    return labels;
  }, [cells]);

  const width = WEEKS * (CELL_SIZE + CELL_GAP);
  const height = DAYS_PER_WEEK * (CELL_SIZE + CELL_GAP) + 20; // +20 for month labels

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg width={width} height={height} className="block">
        {/* Month labels */}
        {monthLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={10}
            className="text-[10px] fill-[var(--text-tertiary)]"
            fontFamily="var(--font-sans)"
          >
            {label.label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y + 16}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={2}
            fill={getIntensity(cell.count)}
            className="heatmap-cell"
          >
            <title>
              {cell.date}: {cell.count} problem{cell.count !== 1 ? "s" : ""}
            </title>
          </rect>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-[var(--text-muted)]">Less</span>
        {[0, 1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm"
            style={{ background: getIntensity(level) }}
          />
        ))}
        <span className="text-[10px] text-[var(--text-muted)]">More</span>
      </div>
    </div>
  );
}
