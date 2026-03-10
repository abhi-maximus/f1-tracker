import React, { useState, useMemo } from 'react';
import TeamCard from './TeamCard';
import TeamComparison from './TeamComparison';
import TeamDetailModal from './TeamDetailModal';
import RacesSection from './RacesSection';
import { useTeams } from '../hooks/useTeams';
import { useTeamStats } from '../hooks/useTeamStats';
import { useStandings } from '../hooks/useStandings';

const FIRST_YEAR = 2023;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);

const SORT_OPTIONS = [
  { key: 'points',      label: 'Standings'   },
  { key: 'reliability', label: 'Reliability' },
  { key: 'dnfs',        label: 'Fewest DNFs' },
  { key: 'pitTime',     label: 'Pit Speed'   },
  { key: 'name',        label: 'A – Z'       },
];

/* ── Shared select styles ── */
const selectCls =
  'bg-white/10 text-white rounded-2xl px-3 font-black text-sm border-0 outline-none ' +
  'appearance-none cursor-pointer min-h-[44px] pr-8 ' +
  'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' ' +
  'width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23aaa\' ' +
  'd=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[center_right_12px]';

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-[28px] bg-white/5 animate-pulse h-80" />
      ))}
    </div>
  );
}

function StatusBar({ sessions, loading, error, lastUpdated }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-5">
      {loading && (
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Fetching data…
        </span>
      )}
      {!loading && !error && (
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          {sessions.length} race{sessions.length !== 1 ? 's' : ''} processed
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          {error}
        </span>
      )}
      {lastUpdated && (
        <span className="ml-auto tabular-nums">{lastUpdated.toLocaleTimeString()}</span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [year, setYear]         = useState(CURRENT_YEAR);
  const [activeTab, setActiveTab] = useState('teams');
  const [selected, setSelected] = useState([]);
  const [detailTeam, setDetailTeam] = useState(null);
  const [sortBy, setSortBy]     = useState('points');

  const { teams, loading: teamsLoading }                                    = useTeams(year);
  const { stats, sessions, loading: statsLoading, error, lastUpdated }      = useTeamStats(year, teams);
  const { constructorPoints, getTeamDriverStandings, loading: standingsLoading } = useStandings(year);

  const loading = teamsLoading || statsLoading || standingsLoading;

  function handleYearChange(y) {
    setYear(y);
    setSelected([]);
    setDetailTeam(null);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSelected([]);
    setDetailTeam(null);
  }

  function handleCompare(team) {
    setSelected((prev) => {
      if (prev.find((t) => t.id === team.id)) return prev.filter((t) => t.id !== team.id);
      if (prev.length >= 2) return [prev[1], team];
      return [...prev, team];
    });
  }

  const sorted = useMemo(() => [...teams].sort((a, b) => {
    const pa = constructorPoints[a.id], pb = constructorPoints[b.id];
    const sa = stats[a.id] || {},      sb = stats[b.id] || {};
    if (sortBy === 'points') {
      const diff = (pa?.position ?? 99) - (pb?.position ?? 99);
      return diff !== 0 ? diff : (pb?.points ?? 0) - (pa?.points ?? 0);
    }
    if (sortBy === 'reliability') return (sb.reliabilityScore ?? 100) - (sa.reliabilityScore ?? 100);
    if (sortBy === 'dnfs')        return (sa.dnfs ?? 0) - (sb.dnfs ?? 0);
    if (sortBy === 'pitTime')     return (parseFloat(sa.avgPitTime) || 999) - (parseFloat(sb.avgPitTime) || 999);
    return a.shortName.localeCompare(b.shortName);
  }), [teams, constructorPoints, stats, sortBy]);

  const compareTeamA = selected[0] ? { team: selected[0], stats: stats[selected[0].id], standings: constructorPoints[selected[0].id] } : null;
  const compareTeamB = selected[1] ? { team: selected[1], stats: stats[selected[1].id], standings: constructorPoints[selected[1].id] } : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Header ── */}
      <header className="border-b border-white/5 sticky top-0 z-10 bg-gray-950/95 backdrop-blur">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">

          {/* Top row: logo + mobile controls */}
          <div className="flex items-center gap-3 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mr-auto min-w-0">
              <span className="text-2xl shrink-0">🏁</span>
              <div className="min-w-0">
                <h1 className="text-base font-black tracking-tight leading-none truncate">F1 Tracker</h1>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5 truncate">
                  {year} Season · OpenF1 + Jolpica
                </p>
              </div>
            </div>

            {/* Mobile: year + sort as selects */}
            <div className="flex sm:hidden items-center gap-2">
              <select
                value={year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className={selectCls}
                aria-label="Select season year"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {activeTab === 'teams' && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={selectCls}
                  aria-label="Sort teams by"
                >
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Desktop: year pills */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 rounded-2xl p-1">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearChange(y)}
                  className={`px-3 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-150 min-h-[36px] ${
                    year === y ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Second row: tabs + sort pills */}
          <div className="flex items-center gap-3 pb-3 flex-wrap">
            {/* Tab pills */}
            <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1">
              {[['teams', '🏎️ Teams'], ['races', '🏁 Races']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-150 min-h-[36px] ${
                    activeTab === key ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort pills (teams tab only, desktop) */}
            {activeTab === 'teams' && (
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-2xl p-1">
                {SORT_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-150 min-h-[36px] ${
                      sortBy === key ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Races tab ── */}
        {activeTab === 'races' && <RacesSection year={year} />}

        {/* ── Teams tab ── */}
        {activeTab === 'teams' && (
          <>
            <StatusBar sessions={sessions} loading={loading} error={error} lastUpdated={lastUpdated} />

            {/* Comparison panel */}
            {selected.length > 0 && (
              <div className="mb-6">
                <TeamComparison
                  teamA={compareTeamA?.team}
                  teamB={compareTeamB?.team}
                  statsA={compareTeamA?.stats}
                  statsB={compareTeamB?.stats}
                  standingsA={compareTeamA?.standings}
                  standingsB={compareTeamB?.standings}
                  onClose={() => setSelected([])}
                />
              </div>
            )}

            {/* Hint */}
            {selected.length === 0 && !loading && (
              <p className="text-xs text-gray-600 mb-5">
                Tap a card to see DNF details · ⚔️ Compare adds a team to the comparison.
              </p>
            )}
            {selected.length === 1 && (
              <p className="text-xs text-yellow-500/70 mb-5">
                Pick one more team to compare with <strong>{selected[0].shortName}</strong>.
              </p>
            )}

            {/* Grid: 1 col mobile · 2 col tablet · 3 col desktop */}
            {loading ? <LoadingGrid /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {sorted.map((team, i) => (
                  <TeamCard
                    key={`${year}-${team.id}`}
                    team={team}
                    stats={stats[team.id]}
                    standings={constructorPoints[team.id]}
                    driverStandings={getTeamDriverStandings(team.id)}
                    onDetail={setDetailTeam}
                    onCompare={handleCompare}
                    selected={!!selected.find((s) => s.id === team.id)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail modal / bottom sheet */}
      {detailTeam && (
        <TeamDetailModal
          team={detailTeam}
          stats={stats[detailTeam.id]}
          onClose={() => setDetailTeam(null)}
          onCompare={() => { handleCompare(detailTeam); setDetailTeam(null); }}
          isSelected={!!selected.find((s) => s.id === detailTeam.id)}
        />
      )}
    </div>
  );
}
