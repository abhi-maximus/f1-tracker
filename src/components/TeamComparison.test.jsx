import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamComparison from './TeamComparison';

const TEAM_A = {
  id: 'ferrari',
  shortName: 'Ferrari',
  bgGradient: 'from-red-600 to-yellow-500',
  textColor: '#fff',
  drivers: ['Charles Leclerc', 'Lewis Hamilton'],
};

const TEAM_B = {
  id: 'mclaren',
  shortName: 'McLaren',
  bgGradient: 'from-orange-500 to-sky-600',
  textColor: '#fff',
  drivers: ['Lando Norris', 'Oscar Piastri'],
};

const STATS_A = { races: 5, dnfs: 2, crashes: 1, engineFailures: 1, avgPitTime: '24.5', reliabilityScore: 80 };
const STATS_B = { races: 5, dnfs: 1, crashes: 0, engineFailures: 1, avgPitTime: '23.0', reliabilityScore: 90 };
const STANDINGS_A = { points: 100 };
const STANDINGS_B = { points: 120 };

describe('TeamComparison', () => {
  it('shows placeholder when no teams selected', () => {
    const { container } = render(<TeamComparison />);
    expect(container.textContent).toContain('Select two teams');
  });

  it('shows placeholder when only one team selected', () => {
    const { container } = render(<TeamComparison teamA={TEAM_A} />);
    expect(container.textContent).toContain('Select two teams');
  });

  it('renders both team names when both provided', () => {
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} />);
    expect(screen.getByText('Ferrari')).toBeTruthy();
    expect(screen.getByText('McLaren')).toBeTruthy();
  });

  it('renders VS divider', () => {
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} />);
    expect(screen.getByText('VS')).toBeTruthy();
  });

  it('renders driver names in team headers', () => {
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} />);
    expect(screen.getByText('Charles Leclerc · Lewis Hamilton')).toBeTruthy();
    expect(screen.getByText('Lando Norris · Oscar Piastri')).toBeTruthy();
  });

  it('renders stat labels', () => {
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} />);
    expect(screen.getByText('Championship Points')).toBeTruthy();
    expect(screen.getByText('Races Completed')).toBeTruthy();
    expect(screen.getByText('DNFs')).toBeTruthy();
    expect(screen.getByText('Crashes')).toBeTruthy();
    expect(screen.getByText('Engine Failures')).toBeTruthy();
    expect(screen.getByText('Avg Pit Stop (s)')).toBeTruthy();
    expect(screen.getByText('Reliability Score')).toBeTruthy();
  });

  it('renders stat values from stats objects', () => {
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} standingsA={STANDINGS_A} standingsB={STANDINGS_B} />);
    // Championship points
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
  });

  it('shows Clear button when onClose provided', () => {
    const onClose = vi.fn();
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} onClose={onClose} />);
    expect(screen.getByText('Clear ✕')).toBeTruthy();
  });

  it('calls onClose when Clear button clicked', () => {
    const onClose = vi.fn();
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} onClose={onClose} />);
    fireEvent.click(screen.getByText('Clear ✕'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show Clear button when onClose is not provided', () => {
    render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} />);
    expect(screen.queryByText('Clear ✕')).toBeNull();
  });

  it('handles missing stats gracefully (defaults to 0)', () => {
    const { container } = render(<TeamComparison teamA={TEAM_A} teamB={TEAM_B} />);
    // No crash — component renders with fallback values
    expect(container.textContent).toContain('VS');
  });

  it('renders teams with no drivers array without crashing', () => {
    const teamNoDrivers = { ...TEAM_A, drivers: [] };
    const { container } = render(
      <TeamComparison teamA={teamNoDrivers} teamB={TEAM_B} statsA={STATS_A} statsB={STATS_B} />
    );
    expect(container.textContent).toContain('Ferrari');
  });
});
