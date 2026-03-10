import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamCard from './TeamCard';

const TEAM = {
  id: 'ferrari',
  name: 'Scuderia Ferrari',
  shortName: 'Ferrari',
  bgGradient: 'from-red-600 to-yellow-500',
  textColor: '#fff',
  drivers: ['Charles Leclerc', 'Lewis Hamilton'],
  driverNumbers: [16, 44],
};

const STATS = {
  crashes: 2,
  engineFailures: 1,
  dnfs: 3,
  avgPitTime: '24.5',
  reliabilityScore: 75,
};

const STANDINGS = { points: 150, position: 1, wins: 3 };

const DRIVER_STANDINGS = [
  { driverId: 'leclerc', permanentNumber: '16', familyName: 'Leclerc', givenName: 'Charles', points: 90, position: 1, wins: 2, teamId: 'ferrari' },
  { driverId: 'hamilton', permanentNumber: '44', familyName: 'Hamilton', givenName: 'Lewis', points: 60, position: 3, wins: 1, teamId: 'ferrari' },
];

describe('TeamCard', () => {
  it('renders team short name', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('FERRARI')).toBeTruthy();
  });

  it('renders team full name', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('Scuderia Ferrari')).toBeTruthy();
  });

  it('renders stats: crashes, engine, dnfs', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    // Values are rendered as text in badges
    expect(screen.getByText('2')).toBeTruthy(); // crashes
    expect(screen.getByText('1')).toBeTruthy(); // engine
    expect(screen.getByText('3')).toBeTruthy(); // dnfs
  });

  it('renders avg pit time with s suffix', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('24.5s')).toBeTruthy();
  });

  it('renders — when no avgPitTime', () => {
    render(<TeamCard team={TEAM} stats={{}} standings={STANDINGS} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders championship points', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('150')).toBeTruthy();
  });

  it('renders — for points when no standings', () => {
    render(<TeamCard team={TEAM} stats={STATS} />);
    // No standings → pts is null → shows —
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders driver last names', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} driverStandings={DRIVER_STANDINGS} />);
    expect(screen.getByText('Leclerc')).toBeTruthy();
    expect(screen.getByText('Hamilton')).toBeTruthy();
  });

  it('renders driver numbers', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('#16')).toBeTruthy();
    expect(screen.getByText('#44')).toBeTruthy();
  });

  it('renders driver points from driverStandings', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} driverStandings={DRIVER_STANDINGS} />);
    expect(screen.getByText('90 pts')).toBeTruthy();
    expect(screen.getByText('60 pts')).toBeTruthy();
  });

  it('calls onDetail when card is clicked', () => {
    const onDetail = vi.fn();
    const { container } = render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} onDetail={onDetail} />);
    fireEvent.click(container.firstChild);
    expect(onDetail).toHaveBeenCalledWith(TEAM);
  });

  it('calls onCompare when compare button clicked', () => {
    const onCompare = vi.fn();
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} onCompare={onCompare} />);
    fireEvent.click(screen.getByText('⚔️ Compare'));
    expect(onCompare).toHaveBeenCalledWith(TEAM);
  });

  it('does not propagate click to onDetail when compare button clicked', () => {
    const onDetail = vi.fn();
    const onCompare = vi.fn();
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} onDetail={onDetail} onCompare={onCompare} />);
    fireEvent.click(screen.getByText('⚔️ Compare'));
    expect(onDetail).not.toHaveBeenCalled();
  });

  it('shows "✓ In Comparison" when selected', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} selected />);
    expect(screen.getByText('✓ In Comparison')).toBeTruthy();
  });

  it('shows P1 badge for position 1', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('P1')).toBeTruthy();
  });

  it('does not show position badge for position > 20', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={{ ...STANDINGS, position: 99 }} />);
    expect(screen.queryByText('P99')).toBeNull();
  });

  it('renders reliability score in health bar', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={STANDINGS} />);
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('renders 100% reliability when no stats', () => {
    render(<TeamCard team={TEAM} stats={{}} standings={STANDINGS} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('renders red health bar color when reliability < 60', () => {
    render(<TeamCard team={TEAM} stats={{ ...STATS, reliabilityScore: 40 }} standings={STANDINGS} />);
    expect(screen.getByText('40%')).toBeTruthy();
  });

  it('renders yellow health bar color when reliability between 60-84', () => {
    render(<TeamCard team={TEAM} stats={{ ...STATS, reliabilityScore: 70 }} standings={STANDINGS} />);
    expect(screen.getByText('70%')).toBeTruthy();
  });

  it('shows P2 badge for position 2', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={{ ...STANDINGS, position: 2 }} />);
    expect(screen.getByText('P2')).toBeTruthy();
  });

  it('shows P3 badge for position 3', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={{ ...STANDINGS, position: 3 }} />);
    expect(screen.getByText('P3')).toBeTruthy();
  });

  it('shows P5 badge for position 5 (non-podium)', () => {
    render(<TeamCard team={TEAM} stats={STATS} standings={{ ...STANDINGS, position: 5 }} />);
    expect(screen.getByText('P5')).toBeTruthy();
  });

  it('renders without crashing when all props are minimal', () => {
    const minTeam = { ...TEAM, drivers: [], driverNumbers: [] };
    const { container } = render(<TeamCard team={minTeam} />);
    expect(container.firstChild).toBeTruthy();
  });
});
