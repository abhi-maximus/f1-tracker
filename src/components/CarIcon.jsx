import React from 'react';

// Each team gets a unique livery color scheme applied to the same car shape.
// Distinct nose/wing accent colors make each car visually unique.

const LIVERIES = {
  red_bull: {
    body: '#1E3A8A',
    wing: '#DC2626',
    cockpit: '#1E3A8A',
    accent: '#FBBF24',
    nose: '#1E3A8A',
  },
  ferrari: {
    body: '#DC2626',
    wing: '#DC2626',
    cockpit: '#7F1D1D',
    accent: '#FBBF24',
    nose: '#991B1B',
  },
  mercedes: {
    body: '#0D9488',
    wing: '#134E4A',
    cockpit: '#0F172A',
    accent: '#5EEAD4',
    nose: '#0D9488',
  },
  mclaren: {
    body: '#EA580C',
    wing: '#0369A1',
    cockpit: '#1C1917',
    accent: '#FED7AA',
    nose: '#EA580C',
  },
  aston_martin: {
    body: '#065F46',
    wing: '#065F46',
    cockpit: '#022C22',
    accent: '#BEF264',
    nose: '#047857',
  },
  alpine: {
    body: '#0284C7',
    wing: '#EC4899',
    cockpit: '#0C4A6E',
    accent: '#E0F2FE',
    nose: '#0369A1',
  },
  haas: {
    body: '#6B7280',
    wing: '#DC2626',
    cockpit: '#111827',
    accent: '#F9FAFB',
    nose: '#374151',
  },
  rb: {
    body: '#4338CA',
    wing: '#1E1B4B',
    cockpit: '#1E1B4B',
    accent: '#A5B4FC',
    nose: '#4338CA',
  },
  williams: {
    body: '#0369A1',
    wing: '#0C4A6E',
    cockpit: '#082F49',
    accent: '#BAE6FD',
    nose: '#0284C7',
  },
  sauber: {
    body: '#16A34A',
    wing: '#14532D',
    cockpit: '#1C1917',
    accent: '#BBF7D0',
    nose: '#15803D',
  },
};

// Short labels on car livery
const CAR_LABELS = {
  red_bull: 'RBR',
  ferrari: 'SF',
  mercedes: 'AMG',
  mclaren: 'MCL',
  aston_martin: 'AMF',
  alpine: 'ALP',
  haas: 'HAAS',
  rb: 'RB',
  williams: 'WIL',
  sauber: 'AUDI',
};

// Alias map so historic constructor IDs still get a livery
const LIVERY_ALIASES = {
  alphatauri: 'rb',
  alfa: 'sauber',
  kick_sauber: 'sauber',
  audi: 'sauber',
  cadillac: 'haas', // closest fallback color-wise
};

export default function CarIcon({ teamId, className = '' }) {
  const resolvedId = LIVERY_ALIASES[teamId] ?? teamId;
  const liv = LIVERIES[resolvedId] ?? {
    body: '#6B7280', wing: '#374151', cockpit: '#111827', accent: '#fff', nose: '#4B5563',
  };
  const label = CAR_LABELS[resolvedId] ?? (teamId ?? '').toUpperCase().slice(0, 4);

  return (
    <svg
      viewBox="0 0 300 110"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${teamId} F1 car`}
    >
      {/* ── REAR WING ── */}
      {/* vertical strut */}
      <rect x="253" y="20" width="7" height="44" rx="2" fill={liv.wing} />
      {/* top horizontal plane */}
      <rect x="238" y="20" width="32" height="7" rx="2" fill={liv.wing} />
      {/* lower flap */}
      <rect x="241" y="30" width="27" height="4" rx="1" fill={liv.body} opacity="0.75" />
      {/* endplates */}
      <rect x="238" y="20" width="3" height="18" rx="1" fill={liv.wing} />
      <rect x="268" y="20" width="3" height="18" rx="1" fill={liv.wing} />

      {/* ── MAIN BODY ── */}
      <path
        d="M 52,74 L 66,48 L 88,40 L 198,37 L 233,50 L 252,68 L 252,80 L 52,80 Z"
        fill={liv.body}
      />
      {/* Sidepod accent stripe */}
      <path
        d="M 108,80 L 113,56 L 188,49 L 230,60 L 230,80 Z"
        fill={liv.wing}
        opacity="0.4"
      />
      {/* Floor / diffuser strip */}
      <rect x="88" y="78" width="164" height="5" rx="0" fill={liv.wing} opacity="0.6" />

      {/* ── NOSE CONE ── */}
      <path d="M 10,74 L 66,48 L 66,80 Z" fill={liv.nose} />
      {/* Nose tip highlight */}
      <path d="M 10,74 L 36,70 L 36,78 Z" fill={liv.accent} opacity="0.5" />

      {/* ── FRONT WING ── */}
      {/* main plane */}
      <rect x="4" y="78" width="72" height="5" rx="1.5" fill={liv.wing} />
      {/* lower cascade */}
      <rect x="0" y="83" width="80" height="3" rx="1" fill={liv.wing} opacity="0.65" />
      {/* endplates */}
      <rect x="0" y="76" width="3.5" height="11" rx="1" fill={liv.wing} />
      <rect x="76" y="76" width="3.5" height="11" rx="1" fill={liv.wing} />

      {/* ── COCKPIT + HALO ── */}
      {/* halo bar */}
      <path
        d="M 130,42 Q 152,22 176,42"
        stroke={liv.cockpit}
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* halo highlight */}
      <path
        d="M 130,42 Q 152,22 176,42"
        stroke={liv.accent}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* cockpit opening */}
      <path d="M 132,43 L 153,31 L 175,43 Z" fill="#0a0a0a" />
      {/* cockpit rim */}
      <path
        d="M 128,44 L 153,28 L 180,44"
        stroke={liv.accent}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* ── ENGINE AIR INTAKE ── */}
      <rect x="153" y="27" width="16" height="14" rx="3" fill="#0a0a0a" />
      <rect x="155" y="29" width="12" height="10" rx="2" fill="#141414" />

      {/* ── FRONT TYRE ── */}
      <circle cx="90" cy="88" r="18" fill="#111" />
      <circle cx="90" cy="88" r="13" fill="#1c1c1c" />
      <circle cx="90" cy="88" r="7"  fill="#282828" />
      <circle cx="90" cy="88" r="15" fill="none" stroke="#2a2a2a" strokeWidth="2" />
      {/* tyre shine */}
      <ellipse cx="84" cy="81" rx="4" ry="2.5" fill="#fff" opacity="0.07" transform="rotate(-30 84 81)" />

      {/* ── REAR TYRE ── */}
      <circle cx="215" cy="88" r="20" fill="#111" />
      <circle cx="215" cy="88" r="15" fill="#1c1c1c" />
      <circle cx="215" cy="88" r="8"  fill="#282828" />
      <circle cx="215" cy="88" r="17" fill="none" stroke="#2a2a2a" strokeWidth="2" />
      <ellipse cx="208" cy="80" rx="5" ry="3" fill="#fff" opacity="0.07" transform="rotate(-30 208 80)" />

      {/* ── TEAM LABEL ON CAR ── */}
      <text
        x="162"
        y="68"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="900"
        fill={liv.accent}
        opacity="0.9"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1.5"
      >
        {label}
      </text>
    </svg>
  );
}
