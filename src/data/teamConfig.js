// Season-agnostic team theme config, keyed by Jolpica constructorId.
// Covers all constructors from 2023 onwards.
export const TEAM_CONFIG = {
  red_bull: {
    shortName: 'Red Bull',
    bgGradient: 'from-blue-700 to-red-700',
    textColor: '#FFFFFF',
  },
  ferrari: {
    shortName: 'Ferrari',
    bgGradient: 'from-red-600 to-yellow-500',
    textColor: '#FFFFFF',
  },
  mercedes: {
    shortName: 'Mercedes',
    bgGradient: 'from-teal-400 to-gray-900',
    textColor: '#0f172a',
  },
  mclaren: {
    shortName: 'McLaren',
    bgGradient: 'from-orange-500 to-sky-600',
    textColor: '#FFFFFF',
  },
  aston_martin: {
    shortName: 'Aston Martin',
    bgGradient: 'from-emerald-700 to-lime-500',
    textColor: '#FFFFFF',
  },
  alpine: {
    shortName: 'Alpine',
    bgGradient: 'from-sky-600 to-pink-400',
    textColor: '#FFFFFF',
  },
  haas: {
    shortName: 'Haas',
    bgGradient: 'from-gray-400 to-red-600',
    textColor: '#FFFFFF',
  },
  // AlphaTauri → RB
  alphatauri: {
    shortName: 'AlphaTauri',
    bgGradient: 'from-indigo-400 to-indigo-900',
    textColor: '#FFFFFF',
  },
  rb: {
    shortName: 'RB',
    bgGradient: 'from-indigo-400 to-indigo-900',
    textColor: '#FFFFFF',
  },
  williams: {
    shortName: 'Williams',
    bgGradient: 'from-sky-400 to-blue-900',
    textColor: '#FFFFFF',
  },
  // Alfa Romeo → Sauber → Kick Sauber → Audi
  alfa: {
    shortName: 'Alfa Romeo',
    bgGradient: 'from-red-700 to-gray-800',
    textColor: '#FFFFFF',
  },
  sauber: {
    shortName: 'Sauber',
    bgGradient: 'from-green-400 to-gray-900',
    textColor: '#FFFFFF',
  },
  kick_sauber: {
    shortName: 'Kick Sauber',
    bgGradient: 'from-green-400 to-gray-900',
    textColor: '#FFFFFF',
  },
  audi: {
    shortName: 'Audi',
    bgGradient: 'from-green-400 to-gray-900',
    textColor: '#FFFFFF',
  },
  // 2026 expansion
  cadillac: {
    shortName: 'Cadillac',
    bgGradient: 'from-rose-600 to-slate-800',
    textColor: '#FFFFFF',
  },
};

// Fallback theme for unknown constructors
export const FALLBACK_CONFIG = {
  shortName: null,        // will use API name
  bgGradient: 'from-gray-600 to-gray-900',
  textColor: '#FFFFFF',
};

export function getTeamTheme(constructorId) {
  return TEAM_CONFIG[constructorId] ?? FALLBACK_CONFIG;
}
