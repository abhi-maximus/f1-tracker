import React, { useState } from 'react';
import { useRaces } from '../hooks/useRaces';
import RaceDetailModal from './RaceDetailModal';

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
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function shortName(raceName) {
  return raceName.replace(' Grand Prix', ' GP');
}

function RaceCard({ race, isPast, index, onClick }) {
  const country = race.Circuit?.Location?.country ?? '';
  const flag = COUNTRY_FLAGS[country] ?? '🏁';

  return (
    <button
      onClick={isPast ? onClick : undefined}
      className={`w-full text-left rounded-[22px] border p-4 transition-all duration-150
        ${isPast
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer active:scale-[0.98]'
          : 'bg-white/[0.02] border-white/5 cursor-default opacity-50'
        }
      `}
      style={{ animationDelay: `${index * 30}ms` }}
      aria-disabled={!isPast}
    >
      {/* Top row: round badge + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black bg-white/10 rounded-full px-2.5 py-1 text-gray-400 uppercase tracking-wider">
          R{race.round}
        </span>
        {isPast
          ? <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Done
            </span>
          : <span className="text-[10px] text-gray-600 font-bold">Upcoming</span>
        }
      </div>

      {/* Flag + race name */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl leading-none shrink-0">{flag}</span>
        <span className="font-black text-sm leading-tight truncate">{shortName(race.raceName)}</span>
      </div>

      {/* Circuit */}
      <p className="text-[11px] text-gray-500 truncate pl-0.5 mb-2">
        {race.Circuit?.circuitName}
      </p>

      {/* Date */}
      <p className="text-[11px] text-gray-600 tabular-nums">{formatDate(race.date)}</p>

      {/* Click hint for past races */}
      {isPast && (
        <p className="text-[10px] text-gray-700 mt-2 font-medium">
          Tap for results →
        </p>
      )}
    </button>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="rounded-[22px] bg-white/5 animate-pulse h-40" />
      ))}
    </div>
  );
}

export default function RacesSection({ year }) {
  const { races, loading, error } = useRaces(year);
  const [selectedRace, setSelectedRace] = useState(null);
  const now = new Date();

  const pastRaces = races.filter((r) => r.date && new Date(r.date) < now);
  const upcomingRaces = races.filter((r) => !r.date || new Date(r.date) >= now);

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-5">
        {loading && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
            Loading schedule…
          </span>
        )}
        {!loading && !error && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {pastRaces.length} completed · {upcomingRaces.length} upcoming
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            {error}
          </span>
        )}
      </div>

      {loading && <LoadingGrid />}

      {!loading && races.length === 0 && !error && (
        <p className="text-gray-600 text-sm text-center py-16">No schedule available for {year}.</p>
      )}

      {!loading && races.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {races.map((race, i) => {
            const isPast = race.date && new Date(race.date) < now;
            return (
              <RaceCard
                key={race.round}
                race={race}
                isPast={isPast}
                index={i}
                onClick={() => setSelectedRace(race)}
              />
            );
          })}
        </div>
      )}

      {selectedRace && (
        <RaceDetailModal
          race={selectedRace}
          year={year}
          onClose={() => setSelectedRace(null)}
        />
      )}
    </div>
  );
}
