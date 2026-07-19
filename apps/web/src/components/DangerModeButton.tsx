import React, { useCallback } from 'react';
import { usePlantStore } from '../store/plantStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/**
 * DangerModeButton — Sits in the header bar.
 *
 * Clicking it POST /api/simulation/danger/on (or /off).
 * Visual state changes are driven by the Zustand store, which is updated
 * via the WebSocket 'simulation_status' message from the server.
 *
 * Phase-aware text:
 *  0–7s   "⚠ Ramping sensors..."
 *  8–17s  "⚠ Shift changeover active"
 *  18–27s "⚠ Hot work permit issued"
 *  28–37s "⚠ Workers entering confined space"
 *  38s+   "🔴 PATTERN 12 ACTIVE"
 */
export const DangerModeButton: React.FC = () => {
  const dangerMode = usePlantStore(s => s.dangerMode);
  const simulationMode = usePlantStore(s => s.simulationMode);
  const elapsed = usePlantStore(s => s.dangerElapsedSeconds);

  const isReturning = simulationMode === 'returning_to_normal';
  const isPattern12 = dangerMode && elapsed >= 38;

  const activateDanger = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/simulation/danger/on`, { method: 'POST' });
    } catch (e) {
      console.error('[DangerMode] Failed to activate:', e);
    }
  }, []);

  const deactivateDanger = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/simulation/danger/off`, { method: 'POST' });
    } catch (e) {
      console.error('[DangerMode] Failed to deactivate:', e);
    }
  }, []);

  /* ─── Phase label ─────────────────────────────────────────────────── */
  const phaseLabel = (): string => {
    if (!dangerMode) return '';
    if (elapsed < 8)  return `⚠ Ramping sensors… ${elapsed}s`;
    if (elapsed < 18) return `⚠ Shift changeover active — ${elapsed}s`;
    if (elapsed < 28) return `⚠ Hot work permit issued — ${elapsed}s`;
    if (elapsed < 38) return `⚠ Workers entering confined space — ${elapsed}s`;
    return `🔴 PATTERN 12 ACTIVE — ${elapsed}s`;
  };

  /* ─── Returning state ─────────────────────────────────────────────── */
  if (isReturning) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-amber-900/60 text-amber-200 border border-amber-700 opacity-80 cursor-not-allowed"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          ↩ Sensors returning to baseline…
        </button>
      </div>
    );
  }

  /* ─── Normal mode ─────────────────────────────────────────────────── */
  if (!dangerMode) {
    return (
      <button
        onClick={activateDanger}
        title="Activates anomalous sensor readings that ramp toward the Vizag compound risk pattern"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                   bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 hover:border-zinc-400
                   hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]"
      >
        <span className="material-symbols-outlined text-[16px] text-zinc-400">science</span>
        Simulate Danger ▶
      </button>
    );
  }

  /* ─── Danger active ───────────────────────────────────────────────── */
  return (
    <div className="flex items-center gap-1">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
          ${isPattern12
            ? 'bg-red-600 text-white border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
            : elapsed >= 28
              ? 'bg-red-700 text-white border border-red-500 animate-pulse'
              : elapsed >= 18
                ? 'bg-orange-700 text-white border border-orange-500'
                : elapsed >= 8
                  ? 'bg-amber-700 text-white border border-amber-500'
                  : 'bg-red-900 text-red-200 border border-red-700'
          }`}
        // In danger mode clicking does nothing before pattern fires — use ×
        onClick={isPattern12 ? deactivateDanger : undefined}
      >
        {isPattern12
          ? <span className="material-symbols-outlined text-[16px]">emergency</span>
          : <span className="inline-block w-2 h-2 rounded-full bg-current animate-ping" />
        }
        {phaseLabel()}
      </button>

      {/* Always-available cancel button */}
      <button
        onClick={deactivateDanger}
        title="Cancel danger scenario"
        className="flex items-center justify-center w-7 h-7 rounded-md
                   bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300
                   border border-zinc-600 hover:border-red-700 transition-all duration-150 text-xs font-bold"
      >
        ×
      </button>
    </div>
  );
};
