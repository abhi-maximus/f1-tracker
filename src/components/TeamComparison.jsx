import React from 'react';

function Bar({ value, max, color, flip = false }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={`h-3 rounded-full bg-white/10 overflow-hidden flex-1 ${flip ? 'flex justify-end' : ''}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CompareRow({ label, leftVal, rightVal, leftColor, rightColor, lowerIsBetter = false }) {
  const left  = parseFloat(leftVal)  || 0;
  const right = parseFloat(rightVal) || 0;
  const max   = Math.max(left, right, 1);

  const leftWins  = lowerIsBetter ? left < right  : left > right;
  const rightWins = lowerIsBetter ? right < left  : right > left;

  return (
    <div className="mb-4">
      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <span className={`w-10 text-right text-sm font-black shrink-0 ${leftWins ? 'text-green-400' : 'text-gray-300'}`}>
          {leftVal ?? '—'}
        </span>
        <Bar value={left}  max={max} color={leftColor}  />
        <Bar value={right} max={max} color={rightColor} flip />
        <span className={`w-10 text-sm font-black shrink-0 ${rightWins ? 'text-green-400' : 'text-gray-300'}`}>
          {rightVal ?? '—'}
        </span>
      </div>
    </div>
  );
}

function TeamHeader({ team, gradient, direction = 'br' }) {
  return (
    <div
      className={`flex-1 bg-gradient-to-${direction} ${team.bgGradient} p-4 text-center min-w-0`}
      style={{ color: team.textColor }}
    >
      <div className="text-2xl mb-1">🏎️</div>
      <div className="text-lg font-black leading-tight truncate">{team.shortName}</div>
      {team.drivers?.length > 0 && (
        <div className="text-[10px] opacity-60 mt-0.5 truncate">
          {team.drivers.join(' · ')}
        </div>
      )}
    </div>
  );
}

export default function TeamComparison({ teamA, teamB, statsA, statsB, standingsA, standingsB, onClose }) {
  if (!teamA || !teamB) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gray-900 p-8 text-center text-gray-500">
        <div className="text-4xl mb-3">⚔️</div>
        <p className="text-sm">Select two teams from the dashboard to compare them head-to-head.</p>
      </div>
    );
  }

  const sA = statsA || {};
  const sB = statsB || {};

  return (
    <div className="rounded-3xl border border-white/10 bg-gray-900 overflow-hidden">

      {/* ── Header: side-by-side on sm+, stacked on mobile ── */}
      <div className="flex flex-col sm:flex-row items-stretch">
        <TeamHeader team={teamA} direction="br" />

        {/* VS divider */}
        <div className="flex sm:flex-col items-center justify-center px-4 py-3 sm:py-4 bg-gray-900 gap-3 sm:gap-2">
          <div className="text-xl font-black text-gray-500">VS</div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-gray-600 active:text-gray-400 transition-colors min-h-[44px] px-3 flex items-center"
            >
              Clear ✕
            </button>
          )}
        </div>

        <TeamHeader team={teamB} direction="bl" />
      </div>

      {/* ── Stats ── */}
      <div className="p-4 sm:p-6">
        <CompareRow label="Championship Points"
          leftVal={standingsA?.points ?? 0}   rightVal={standingsB?.points ?? 0}
          leftColor="bg-yellow-400"            rightColor="bg-yellow-400" />
        <CompareRow label="Races Completed"
          leftVal={sA.races ?? 0}             rightVal={sB.races ?? 0}
          leftColor="bg-blue-500"              rightColor="bg-orange-500" />
        <CompareRow label="DNFs"
          leftVal={sA.dnfs ?? 0}             rightVal={sB.dnfs ?? 0}
          leftColor="bg-red-500"              rightColor="bg-red-500"     lowerIsBetter />
        <CompareRow label="Crashes"
          leftVal={sA.crashes ?? 0}          rightVal={sB.crashes ?? 0}
          leftColor="bg-orange-500"           rightColor="bg-orange-500"  lowerIsBetter />
        <CompareRow label="Engine Failures"
          leftVal={sA.engineFailures ?? 0}   rightVal={sB.engineFailures ?? 0}
          leftColor="bg-yellow-500"           rightColor="bg-yellow-500"  lowerIsBetter />
        <CompareRow label="Avg Pit Stop (s)"
          leftVal={sA.avgPitTime ?? '—'}     rightVal={sB.avgPitTime ?? '—'}
          leftColor="bg-sky-500"              rightColor="bg-sky-500"     lowerIsBetter />
        <CompareRow label="Reliability Score"
          leftVal={sA.reliabilityScore ?? 100} rightVal={sB.reliabilityScore ?? 100}
          leftColor="bg-green-500"            rightColor="bg-green-500" />
      </div>
    </div>
  );
}
