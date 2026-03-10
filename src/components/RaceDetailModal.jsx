import React, { useState, useEffect } from 'react';
import { useRaceDetail } from '../hooks/useRaceDetail';
import { getTeamTheme } from '../data/teamConfig';

const PODIUM_EMOJI = ['🥇', '🥈', '🥉'];

const COUNTRY_FLAGS = {
  Australia: '🇦🇺', Bahrain: '🇧🇭', 'Saudi Arabia': '🇸🇦', China: '🇨🇳',
  Japan: '🇯🇵', USA: '🇺🇸', 'United States': '🇺🇸', Italy: '🇮🇹',
  Monaco: '🇲🇨', Canada: '🇨🇦', Spain: '🇪🇸', Austria: '🇦🇹',
  UK: '🇬🇧', 'United Kingdom': '🇬🇧', Hungary: '🇭🇺', Belgium: '🇧🇪',
  Netherlands: '🇳🇱', Singapore: '🇸🇬', Azerbaijan: '🇦🇿', Mexico: '🇲🇽',
  Brazil: '🇧🇷', UAE: '🇦🇪', Qatar: '🇶🇦', France: '🇫🇷',
  Germany: '🇩🇪', Portugal: '🇵🇹', Turkey: '🇹🇷', Argentina: '🇦🇷',
  Russia: '🇷🇺', Korea: '🇰🇷', 'South Africa': '🇿🇦',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function PositionCell({ result }) {
  if (result.positionText === 'D') return <span className="text-[10px] font-black text-yellow-400">DSQ</span>;
  if (result.positionText === 'W') return <span className="text-[10px] font-black text-gray-500">DNS</span>;
  if (result.positionText === 'R' || result.position === null)
    return <span className="text-lg leading-none">🔴</span>;
  if (result.position <= 3)
    return <span className="text-lg leading-none">{PODIUM_EMOJI[result.position - 1]}</span>;
  return <span className="text-sm font-black text-gray-300">{result.position}</span>;
}

function RaceRow({ result }) {
  const theme = getTeamTheme(result.constructorId);
  const isWinner = result.position === 1;
  const isDNF = result.positionText === 'R' || result.position === null;

  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl transition-colors
      ${isWinner ? 'bg-yellow-400/10 border border-yellow-400/20' : 'hover:bg-white/5'}
      ${isDNF ? 'opacity-60' : ''}
    `}>
      {/* Position */}
      <div className="w-8 flex items-center justify-center shrink-0">
        <PositionCell result={result} />
      </div>

      {/* Driver number */}
      <span className="text-[11px] font-black text-gray-500 w-5 shrink-0 hidden sm:block">
        {result.permanentNumber}
      </span>

      {/* Team colour bar */}
      <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${theme.bgGradient} shrink-0 opacity-90`} />

      {/* Driver + team */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black leading-tight truncate">
          {result.givenName[0]}. {result.familyName}
        </p>
        <p className="text-[10px] text-gray-500 truncate">{theme.shortName}</p>
      </div>

      {/* Right side: winner badge / points / DNF status */}
      <div className="shrink-0 text-right">
        {isWinner && (
          <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            Winner
          </span>
        )}
        {!isWinner && !isDNF && result.points > 0 && (
          <span className="text-xs text-gray-400 font-bold">+{result.points}pts</span>
        )}
        {isDNF && (
          <span className="text-[10px] text-red-400 font-bold leading-tight max-w-[90px] truncate block">
            {result.status || 'Retired'}
          </span>
        )}
      </div>
    </div>
  );
}

function QualRow({ result }) {
  const theme = getTeamTheme(result.constructorId);
  const isPole = result.position === 1;

  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl transition-colors
      ${isPole ? 'bg-yellow-400/10 border border-yellow-400/20' : 'hover:bg-white/5'}
    `}>
      {/* Position */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {isPole
          ? <span className="text-lg leading-none">🥇</span>
          : <span className="text-sm font-black text-gray-300">{result.position}</span>
        }
      </div>

      {/* Driver number */}
      <span className="text-[11px] font-black text-gray-500 w-5 shrink-0 hidden sm:block">
        {result.permanentNumber}
      </span>

      {/* Team colour bar */}
      <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${theme.bgGradient} shrink-0 opacity-90`} />

      {/* Driver + team */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black leading-tight truncate">
          {result.givenName[0]}. {result.familyName}
        </p>
        <p className="text-[10px] text-gray-500 truncate">{theme.shortName}</p>
      </div>

      {/* Best time */}
      <div className="shrink-0 text-right">
        {isPole && (
          <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mr-1 hidden sm:inline">
            Pole
          </span>
        )}
        <span className="text-xs font-mono text-gray-300 tabular-nums">
          {result.q3 ?? result.q2 ?? result.q1 ?? '—'}
        </span>
      </div>
    </div>
  );
}

export default function RaceDetailModal({ race, year, onClose }) {
  const [tab, setTab] = useState('race');
  const { qualifying, results, loading } = useRaceDetail(year, race.round);

  const flag = COUNTRY_FLAGS[race.Circuit?.Location?.country] ?? '🏁';

  // Close on Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="modal-enter relative w-full sm:w-[520px] max-h-[92dvh] sm:max-h-[85vh]
        bg-gray-900 sm:rounded-[28px] rounded-t-[28px]
        flex flex-col overflow-hidden
        border border-white/10 shadow-2xl
        pb-[env(safe-area-inset-bottom)]">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
          {/* Drag handle (mobile) */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start gap-3">
            <span className="text-4xl leading-none shrink-0">{flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black bg-white/10 rounded-full px-2 py-0.5 text-gray-400 uppercase tracking-wider">
                  Round {race.round}
                </span>
              </div>
              <h2 className="text-lg font-black leading-tight truncate">{race.raceName}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{race.Circuit?.circuitName}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">{formatDate(race.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white/5 rounded-xl p-1">
            {[['race', '🏁 Race'], ['qualifying', '⏱ Qualifying']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-black tracking-wide transition-all duration-150
                  ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading && (
            <div className="flex flex-col gap-2 py-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && tab === 'race' && (
            results.length === 0
              ? <p className="text-center text-gray-600 py-10 text-sm">No race data available.</p>
              : <div className="flex flex-col gap-1">
                  {results.map((r) => <RaceRow key={r.driverId} result={r} />)}
                </div>
          )}

          {!loading && tab === 'qualifying' && (
            qualifying.length === 0
              ? <p className="text-center text-gray-600 py-10 text-sm">No qualifying data available.</p>
              : <div className="flex flex-col gap-1">
                  {qualifying.map((r) => <QualRow key={r.driverId} result={r} />)}
                </div>
          )}
        </div>
      </div>
    </div>
  );
}
