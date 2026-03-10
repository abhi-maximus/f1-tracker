import React from 'react';
import CarIcon from './CarIcon';

/* ── Chunky video-game stat badge ───────────────────────────────────────── */
function StatBadge({ emoji, label, value, delay = 0, accent = 'bg-black/30', textColor }) {
  return (
    <div
      className="badge-pop-in flex flex-col items-center justify-center rounded-2xl px-3 py-2 gap-0.5 select-none"
      style={{
        animationDelay: `${delay}ms`,
        background: accent,
        color: textColor,
        minWidth: 0,
      }}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="text-base font-black leading-none mt-0.5">{value ?? '—'}</span>
      <span className="text-[9px] font-bold uppercase tracking-widest opacity-65 leading-none">
        {label}
      </span>
    </div>
  );
}

/* ── Chunky segmented health bar ────────────────────────────────────────── */
function HealthBar({ score, delay = 0 }) {
  const segments = 10;
  const filled = Math.round((score / 100) * segments);
  const segColor =
    score >= 85 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';
  const glowColor =
    score >= 85 ? '#4ade8066' : score >= 60 ? '#facc1566' : '#f8717166';

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black uppercase tracking-widest opacity-80">
          ⭐ Reliability
        </span>
        <span
          className="text-xl font-black leading-none"
          style={{ color: segColor, textShadow: `0 0 12px ${glowColor}` }}
        >
          {score}%
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-4 rounded-md transition-all duration-300"
            style={{
              backgroundColor: i < filled ? segColor : 'rgba(255,255,255,0.12)',
              boxShadow: i < filled ? `0 0 6px ${glowColor}` : 'none',
              transitionDelay: `${delay + i * 60}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Driver chip ────────────────────────────────────────────────────────── */
function DriverChip({ name, number, points, position, textColor }) {
  return (
    <div
      className="flex-1 rounded-2xl px-2.5 py-2 bg-black/25 min-w-0"
      style={{ color: textColor }}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[9px] font-black opacity-50">#{number}</span>
        {position && (
          <span className="text-[9px] font-black opacity-70">P{position}</span>
        )}
      </div>
      <div className="text-[12px] font-black leading-tight truncate">
        {name.split(' ').pop()}
      </div>
      {points != null && (
        <div className="text-[10px] font-bold opacity-65 mt-0.5">{points} pts</div>
      )}
    </div>
  );
}

/* ── Championship position badge ────────────────────────────────────────── */
function PosBadge({ position }) {
  if (!position || position > 20) return null;
  const style =
    position === 1 ? { bg: '#FBBF24', text: '#78350F' } :
    position === 2 ? { bg: '#D1D5DB', text: '#1F2937' } :
    position === 3 ? { bg: '#D97706', text: '#FFFBEB' } :
                     { bg: 'rgba(255,255,255,0.15)', text: 'inherit' };
  return (
    <span
      className="text-[11px] font-black px-2 py-0.5 rounded-full leading-none"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      P{position}
    </span>
  );
}

/* ── Main TeamCard ──────────────────────────────────────────────────────── */
export default function TeamCard({
  team,
  stats,
  standings,
  driverStandings = [],
  onDetail,
  onCompare,
  selected,
  index = 0,
}) {
  const s = stats || {};
  const avgPit = s.avgPitTime ? `${s.avgPitTime}s` : '—';
  const pts = standings?.points ?? null;
  const pos = standings?.position ?? null;

  // Tilt only on devices that support hover (not touch-primary) to avoid layout jank on mobile
  const tiltClass = index % 2 === 0 ? 'sm:hover:rotate-[1.5deg]' : 'sm:hover:-rotate-[1.5deg]';

  return (
    <div
      onClick={() => onDetail?.(team)}
      className={`
        card-pop-in relative cursor-pointer rounded-[28px] overflow-hidden
        flex flex-col
        shadow-2xl
        ${tiltClass} hover:scale-[1.04]
        transition-all duration-200 ease-out
        ${selected ? 'ring-4 ring-white ring-offset-4 ring-offset-gray-950 scale-[1.02]' : ''}
      `}
      style={{
        animationDelay: `${index * 60}ms`,
        background: '#18181b',
      }}
    >
      {/* ── BANNER: gradient + car ── */}
      <div
        className={`relative bg-gradient-to-br ${team.bgGradient} px-4 pt-4 pb-3`}
        style={{ color: team.textColor }}
      >
        {/* Noise texture overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Team name + position */}
        <div className="flex items-start justify-between mb-2 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <PosBadge position={pos} />
            </div>
            <h2
              className="text-2xl font-black leading-none tracking-tight text-stroke"
              style={{ color: team.textColor }}
            >
              {team.shortName.toUpperCase()}
            </h2>
            <p className="text-[10px] font-bold opacity-55 mt-0.5 uppercase tracking-wider">
              {team.name}
            </p>
          </div>

          {/* Points bubble */}
          <div
            className="flex flex-col items-center justify-center rounded-2xl px-3 py-2 bg-black/25 text-center shrink-0 ml-2"
            style={{ color: team.textColor }}
          >
            <span className="text-2xl font-black leading-none">{pts ?? '—'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-0.5">
              pts
            </span>
          </div>
        </div>

        {/* Car SVG — large */}
        <div className="relative z-10">
          <CarIcon
            teamId={team.id}
            className="w-full h-20 drop-shadow-xl"
          />
        </div>
      </div>

      {/* ── BODY: dark section ── */}
      <div className="flex flex-col gap-3 pt-3 bg-zinc-900 flex-1">

        {/* Driver chips */}
        <div className="flex gap-2 px-4" style={{ color: '#fff' }}>
          {team.drivers.map((name, i) => {
            const num = team.driverNumbers[i];
            const ds = driverStandings.find(
              (d) => d.permanentNumber === String(num) ||
                     d.familyName === name.split(' ').pop()
            );
            return (
              <DriverChip
                key={name}
                name={name}
                number={num}
                points={ds?.points ?? null}
                position={ds?.position ?? null}
                textColor="#fff"
              />
            );
          })}
        </div>

        {/* Stat badges — 2×2 grid */}
        <div className="grid grid-cols-2 gap-2 px-4" style={{ color: '#fff' }}>
          <StatBadge
            emoji="💥"
            label="Crashes"
            value={s.crashes ?? 0}
            delay={100 + index * 30}
            accent="rgba(239,68,68,0.2)"
          />
          <StatBadge
            emoji="🔧"
            label="Engine"
            value={s.engineFailures ?? 0}
            delay={160 + index * 30}
            accent="rgba(251,191,36,0.18)"
          />
          <StatBadge
            emoji="🏁"
            label="DNFs"
            value={s.dnfs ?? 0}
            delay={220 + index * 30}
            accent="rgba(168,85,247,0.2)"
          />
          <StatBadge
            emoji="⏱️"
            label="Avg Pit"
            value={avgPit}
            delay={280 + index * 30}
            accent="rgba(56,189,248,0.18)"
          />
        </div>

        {/* Health bar */}
        <HealthBar score={s.reliabilityScore ?? 100} delay={300 + index * 40} />

        {/* Compare button — min 44px tall for finger tap */}
        <div className="px-4 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); onCompare?.(team); }}
            className={`w-full rounded-2xl min-h-[44px] text-xs font-black uppercase tracking-widest transition-all duration-150 ${
              selected
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20 active:bg-white/30'
            }`}
          >
            {selected ? '✓ In Comparison' : '⚔️ Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
