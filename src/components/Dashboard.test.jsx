import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock all three hooks
vi.mock('../hooks/useTeams', () => ({ useTeams: vi.fn() }));
vi.mock('../hooks/useTeamStats', () => ({ useTeamStats: vi.fn() }));
vi.mock('../hooks/useStandings', () => ({ useStandings: vi.fn() }));

import { useTeams } from '../hooks/useTeams';
import { useTeamStats } from '../hooks/useTeamStats';
import { useStandings } from '../hooks/useStandings';

const MOCK_TEAMS = [
  {
    id: 'ferrari',
    name: 'Scuderia Ferrari',
    shortName: 'Ferrari',
    bgGradient: 'from-red-600 to-yellow-500',
    textColor: '#fff',
    drivers: ['Charles Leclerc', 'Lewis Hamilton'],
    driverNumbers: [16, 44],
    constructorId: 'ferrari',
  },
  {
    id: 'mclaren',
    name: 'McLaren F1 Team',
    shortName: 'McLaren',
    bgGradient: 'from-orange-500 to-sky-600',
    textColor: '#fff',
    drivers: ['Lando Norris', 'Oscar Piastri'],
    driverNumbers: [4, 81],
    constructorId: 'mclaren',
  },
];

const MOCK_STATS = {
  ferrari: { races: 5, dnfs: 2, crashes: 1, engineFailures: 1, avgPitTime: '24.5', reliabilityScore: 80, dnfHistory: [] },
  mclaren: { races: 5, dnfs: 1, crashes: 0, engineFailures: 1, avgPitTime: '23.0', reliabilityScore: 90, dnfHistory: [] },
};

const MOCK_CONSTRUCTOR_POINTS = {
  ferrari: { points: 100, position: 1, wins: 3 },
  mclaren: { points: 120, position: 2, wins: 2 },
};

function setupMocks({ loading = false, error = null, lastUpdated = null } = {}) {
  useTeams.mockReturnValue({ teams: MOCK_TEAMS, loading: false });
  useTeamStats.mockReturnValue({ stats: MOCK_STATS, sessions: [{}], loading, error, lastUpdated });
  useStandings.mockReturnValue({
    constructorPoints: MOCK_CONSTRUCTOR_POINTS,
    driverPoints: {},
    getTeamDriverStandings: () => [],
    loading: false,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupMocks();
});

describe('Dashboard', () => {
  it('renders F1 Tracker header', () => {
    render(<Dashboard />);
    expect(screen.getByText('F1 Tracker')).toBeTruthy();
  });

  it('renders team cards for all teams', () => {
    render(<Dashboard />);
    expect(screen.getByText('FERRARI')).toBeTruthy();
    expect(screen.getByText('MCLAREN')).toBeTruthy();
  });

  it('shows loading skeleton grid when loading', () => {
    useTeams.mockReturnValue({ teams: [], loading: true });
    useTeamStats.mockReturnValue({ stats: {}, sessions: [], loading: true, error: null, lastUpdated: null });
    useStandings.mockReturnValue({ constructorPoints: {}, driverPoints: {}, getTeamDriverStandings: () => [], loading: true });
    const { container } = render(<Dashboard />);
    // Loading grid renders pulse skeletons (animate-pulse divs)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows "races processed" status when not loading', () => {
    render(<Dashboard />);
    expect(screen.getByText('1 race processed')).toBeTruthy();
  });

  it('shows "races processed" plural for multiple sessions', () => {
    useTeamStats.mockReturnValue({ stats: MOCK_STATS, sessions: [{}, {}], loading: false, error: null, lastUpdated: null });
    render(<Dashboard />);
    expect(screen.getByText('2 races processed')).toBeTruthy();
  });

  it('shows error in status bar when error is set', () => {
    setupMocks({ error: 'Network error' });
    render(<Dashboard />);
    expect(screen.getByText('Network error')).toBeTruthy();
  });

  it('shows hint text when no team selected', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Tap a card to see DNF details/)).toBeTruthy();
  });

  it('shows "pick one more" hint after selecting one team', () => {
    render(<Dashboard />);
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]);
    expect(screen.getByText(/Pick one more team to compare with/)).toBeTruthy();
    expect(screen.getByText('Ferrari')).toBeTruthy(); // strong tag inside hint
  });

  it('shows comparison panel after selecting two teams', () => {
    render(<Dashboard />);
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]); // ferrari
    fireEvent.click(compareButtons[1]); // mclaren
    expect(screen.getByText('VS')).toBeTruthy();
  });

  it('toggles team out of comparison when clicked again', () => {
    render(<Dashboard />);
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]); // select ferrari
    // Ferrari button now shows "✓ In Comparison" — click it again to deselect
    fireEvent.click(screen.getByText('✓ In Comparison'));
    expect(screen.queryByText('✓ In Comparison')).toBeNull();
  });

  it('clears comparison when Clear button clicked', () => {
    render(<Dashboard />);
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]);
    fireEvent.click(compareButtons[1]);
    expect(screen.getByText('VS')).toBeTruthy();
    fireEvent.click(screen.getByText('Clear ✕'));
    expect(screen.queryByText('VS')).toBeNull();
  });

  it('opens detail modal when card is clicked', () => {
    const { container } = render(<Dashboard />);
    // Click the first team card (not the compare button)
    const cards = container.querySelectorAll('.card-pop-in');
    fireEvent.click(cards[0]);
    expect(screen.getByText('DNF Report')).toBeTruthy();
  });

  it('closes detail modal when close button clicked', () => {
    const { container } = render(<Dashboard />);
    const cards = container.querySelectorAll('.card-pop-in');
    fireEvent.click(cards[0]);
    expect(screen.getByText('DNF Report')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('DNF Report')).toBeNull();
  });

  it('adds to comparison from modal and closes it', () => {
    const { container } = render(<Dashboard />);
    const cards = container.querySelectorAll('.card-pop-in');
    fireEvent.click(cards[0]); // open ferrari modal
    fireEvent.click(screen.getByText('⚔️ Compare This Team'));
    // Modal should close and ferrari should be in comparison
    expect(screen.queryByText('DNF Report')).toBeNull();
    expect(screen.getByText('✓ In Comparison')).toBeTruthy();
  });

  it('shows current year in header subtitle', () => {
    render(<Dashboard />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`${currentYear} Season · OpenF1 + Jolpica`)).toBeTruthy();
  });

  it('renders year options in header', () => {
    render(<Dashboard />);
    const currentYear = new Date().getFullYear();
    // Desktop year pills
    for (let y = 2023; y <= currentYear; y++) {
      // There might be multiple elements per year (mobile select + desktop button)
      expect(screen.getAllByText(String(y)).length).toBeGreaterThan(0);
    }
  });

  it('changes year when year select changed (mobile)', () => {
    render(<Dashboard />);
    const yearSelect = screen.getByLabelText('Select season year');
    fireEvent.change(yearSelect, { target: { value: '2023' } });
    expect(screen.getByText('2023 Season · OpenF1 + Jolpica')).toBeTruthy();
  });

  it('resets selected teams when year changes', () => {
    render(<Dashboard />);
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]);
    expect(screen.getByText(/Pick one more/)).toBeTruthy();

    const yearSelect = screen.getByLabelText('Select season year');
    fireEvent.change(yearSelect, { target: { value: '2023' } });
    expect(screen.queryByText(/Pick one more/)).toBeNull();
  });

  it('can change sort order via mobile sort select', () => {
    render(<Dashboard />);
    const sortSelect = screen.getByLabelText('Sort teams by');
    fireEvent.change(sortSelect, { target: { value: 'reliability' } });
    // Should not crash; sorted is recomputed
    expect(screen.getByText('FERRARI')).toBeTruthy();
  });

  it('shows "Fetching data…" when loading', () => {
    setupMocks({ loading: true });
    useTeams.mockReturnValue({ teams: [], loading: true });
    render(<Dashboard />);
    expect(screen.getByText('Fetching data…')).toBeTruthy();
  });

  it('shows lastUpdated time when available', () => {
    const date = new Date('2026-03-08T12:00:00Z');
    setupMocks({ lastUpdated: date });
    render(<Dashboard />);
    expect(screen.getByText(date.toLocaleTimeString())).toBeTruthy();
  });

  it('sorts by A-Z (name)', () => {
    render(<Dashboard />);
    const sortSelect = screen.getByLabelText('Sort teams by');
    fireEvent.change(sortSelect, { target: { value: 'name' } });
    // Ferrari (F) comes before McLaren (M) alphabetically
    const cards = screen.getAllByText(/FERRARI|MCLAREN/);
    expect(cards[0].textContent).toBe('FERRARI');
  });

  it('sorts by fewest DNFs', () => {
    render(<Dashboard />);
    const sortSelect = screen.getByLabelText('Sort teams by');
    fireEvent.change(sortSelect, { target: { value: 'dnfs' } });
    // mclaren has 1 DNF, ferrari has 2 — mclaren should come first
    const cards = screen.getAllByText(/FERRARI|MCLAREN/);
    expect(cards[0].textContent).toBe('MCLAREN');
  });

  it('sorts by pit speed', () => {
    render(<Dashboard />);
    const sortSelect = screen.getByLabelText('Sort teams by');
    fireEvent.change(sortSelect, { target: { value: 'pitTime' } });
    // mclaren 23.0 < ferrari 24.5 → mclaren first
    const cards = screen.getAllByText(/FERRARI|MCLAREN/);
    expect(cards[0].textContent).toBe('MCLAREN');
  });

  it('sorts by reliability', () => {
    render(<Dashboard />);
    const sortSelect = screen.getByLabelText('Sort teams by');
    fireEvent.change(sortSelect, { target: { value: 'reliability' } });
    // mclaren 90 > ferrari 80 → mclaren first
    const cards = screen.getAllByText(/FERRARI|MCLAREN/);
    expect(cards[0].textContent).toBe('MCLAREN');
  });

  it('shows isSelected=true in modal when selected team card is opened', () => {
    const { container } = render(<Dashboard />);
    // First select ferrari via compare button
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]);
    // Now open ferrari's card to show modal - ferrari is now selected
    const cards = container.querySelectorAll('.card-pop-in');
    fireEvent.click(cards[0]); // click the card (not compare button)
    // Modal should show "Added to Comparison" since ferrari is already selected
    expect(screen.getByText('✓ Added to Comparison')).toBeTruthy();
  });

  it('replaces oldest team when third team compared (keeps last 2)', () => {
    // Mock with 3 teams
    const thirdTeam = {
      id: 'mercedes', name: 'Mercedes-AMG', shortName: 'Mercedes',
      bgGradient: 'from-teal-500 to-teal-900', textColor: '#fff',
      drivers: ['George Russell', 'Kimi Antonelli'], driverNumbers: [63, 12], constructorId: 'mercedes',
    };
    useTeams.mockReturnValue({ teams: [...MOCK_TEAMS, thirdTeam], loading: false });
    useTeamStats.mockReturnValue({
      stats: { ...MOCK_STATS, mercedes: { races: 5, dnfs: 0, crashes: 0, engineFailures: 0, avgPitTime: '22.0', reliabilityScore: 100, dnfHistory: [] } },
      sessions: [{}], loading: false, error: null, lastUpdated: null,
    });
    render(<Dashboard />);
    const compareButtons = screen.getAllByText('⚔️ Compare');
    fireEvent.click(compareButtons[0]); // ferrari
    fireEvent.click(compareButtons[1]); // mclaren — now 2 teams selected
    fireEvent.click(compareButtons[2]); // mercedes — should replace ferrari
    // Ferrari should no longer be "In Comparison"
    expect(screen.getAllByText('✓ In Comparison')).toHaveLength(2);
    expect(screen.getAllByText('⚔️ Compare')).toHaveLength(1); // only ferrari unselected
  });
});
