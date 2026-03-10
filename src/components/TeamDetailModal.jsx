import React, { useEffect, useRef } from 'react';
import CarIcon from './CarIcon';

const TYPE_CONFIG = {
  crash:  { icon: '💥', label: 'Crash',      bg: 'bg-red-500/20',    border: 'border-red-500/40',    text: 'text-red-300'    },
  engine: { icon: '🔧', label: 'Mechanical', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-300' },
  dnf:    { icon: '🏳️', label: 'Retirement', bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300' },
};

function MiniStatBubble({ emoji, value, label, color }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl px-3 py-3 ${color} flex-1 min-w-0`}>
      <span className="text-xl leading-none">{emoji}</span>
      <span className="text-xl font-black leading-none mt-1">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 mt-0.5 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

function IncidentCard({ incident, delay }) {
  const cfg = TYPE_CONFIG[incident.type] ?? TYPE_CONFIG.dnf;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${cfg.bg} ${cfg.border}`}
      style={{ animation: `badge-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both` }}
    >
      <span className="text-2xl shrink-0">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-sm text-white">{incident.driverName}</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <div className="text-xs opacity-60 mt-0.5 truncate">{incident.status}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-lg font-black text-white leading-none">
          {incident.lapsCompleted > 0 ? `L${incident.lapsCompleted}` : '—'}
        </div>
        <div className="text-[9px] uppercase tracking-wider opacity-50 mt-0.5">lap</div>
      </div>
    </div>
  );
}

function RaceBlock({ entry, baseDelay }) {
  const date = new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">
          R{entry.round}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm text-white leading-tight truncate">{entry.raceName}</div>
          <div className="text-[11px] opacity-50">{entry.circuit} · {date}</div>
        </div>
        <div className="text-xl shrink-0">🏁</div>
      </div>
      <div className="flex flex-col gap-2 pl-12">
        {entry.incidents.map((inc, i) => (
          <IncidentCard key={i} incident={inc} delay={baseDelay + i * 80} />
        ))}
      </div>
    </div>
  );
}

export default function TeamDetailModal({ team, stats, onClose, onCompare, isSelected }) {
  const overlayRef = useRef(null);
  const s = stats || {};
  const history = s.dnfHistory ?? [];

  const totalDnfs    = s.dnfs ?? 0;
  const totalCrashes = s.crashes ?? 0;
  const totalEngine  = s.engineFailures ?? 0;
  const totalOther   = totalDnfs - totalCrashes - totalEngine;

  // Keyboard close
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    // Overlay: items-end on mobile (sheet sits at bottom), items-center on sm+
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      {/*
        Sheet:
        - Mobile: full width, rounded top corners, max 88vh
        - Desktop: max-w-md, fully rounded, max 90vh
      */}
      <div
        className={`
          modal-enter
          relative w-full sm:max-w-md flex flex-col overflow-hidden shadow-2xl
          rounded-t-[28px] sm:rounded-[28px]
          max-h-[88vh] sm:max-h-[90vh]
        `}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 bg-zinc-900 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* ── Gradient header ── */}
        <div
          className={`bg-gradient-to-br ${team.bgGradient} px-5 pt-4 pb-4 shrink-0`}
          style={{ color: team.textColor }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                DNF Report
              </div>
              <h2 className="text-2xl font-black leading-none text-stroke">
                {team.shortName.toUpperCase()}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 rounded-full bg-black/30 active:bg-black/50 flex items-center justify-center text-lg transition-colors shrink-0 ml-3"
            >
              ✕
            </button>
          </div>

          <CarIcon teamId={team.id} className="w-full h-14 drop-shadow-xl mb-3" />

          <div className="flex gap-2">
            <MiniStatBubble emoji="🏁" value={totalDnfs}    label="DNFs"       color="bg-black/25" />
            <MiniStatBubble emoji="💥" value={totalCrashes} label="Crashes"    color="bg-red-900/40" />
            <MiniStatBubble emoji="🔧" value={totalEngine}  label="Mechanical" color="bg-yellow-900/40" />
            <MiniStatBubble emoji="🏳️" value={totalOther}   label="Other"      color="bg-purple-900/40" />
          </div>
        </div>

        {/* ── Scrollable timeline ── */}
        <div className="flex-1 overflow-y-auto bg-zinc-900 px-5 py-5 min-h-0 overscroll-contain">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-lg font-black text-white">Clean season so far!</div>
              <div className="text-sm text-gray-500 mt-2">No DNFs or retirements recorded.</div>
            </div>
          ) : (
            <>
              <div className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-4">
                Incident Timeline
              </div>
              {history.map((entry, i) => (
                <RaceBlock key={entry.round} entry={entry} baseDelay={i * 60} />
              ))}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-zinc-900 border-t border-white/5 px-5 py-4 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onCompare}
            className={`w-full rounded-2xl py-3.5 font-black text-sm uppercase tracking-widest transition-all duration-200 min-h-[52px] ${
              isSelected
                ? 'bg-white text-gray-900 shadow-lg'
                : 'bg-white/10 text-white active:bg-white/20'
            }`}
          >
            {isSelected ? '✓ Added to Comparison' : '⚔️ Compare This Team'}
          </button>
        </div>
      </div>
    </div>
  );
}
