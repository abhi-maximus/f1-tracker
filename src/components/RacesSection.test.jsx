import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RacesSection from './RacesSection';

vi.mock('../hooks/useRaces', () => ({ useRaces: vi.fn() }));
vi.mock('./RaceDetailModal', () => ({
  default: ({ race, onClose }) => (
    <div data-testid="race-detail-modal">
      <span>{race.raceName}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

import { useRaces } from '../hooks/useRaces';

const PAST_RACE = {
  round: '1',
  raceName: 'Australian Grand Prix',
  date: '2023-03-15',
  Circuit: { circuitName: 'Albert Park Circuit', Location: { country: 'Australia' } },
};

const FUTURE_RACE = {
  round: '2',
  raceName: 'Bahrain Grand Prix',
  date: '2099-03-29',
  Circuit: { circuitName: 'Bahrain International Circuit', Location: { country: 'Bahrain' } },
};

beforeEach(() => vi.clearAllMocks());

describe('RacesSection', () => {
  it('shows loading skeletons while fetching', () => {
    useRaces.mockReturnValue({ races: [], loading: true, error: null });
    const { container } = render(<RacesSection year={2026} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows "Loading schedule…" status text while loading', () => {
    useRaces.mockReturnValue({ races: [], loading: true, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('Loading schedule…')).toBeTruthy();
  });

  it('renders race cards when loaded', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE, FUTURE_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('Australian GP')).toBeTruthy();
    expect(screen.getByText('Bahrain GP')).toBeTruthy();
  });

  it('shows completed and upcoming counts in status bar', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE, FUTURE_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText(/1 completed/)).toBeTruthy();
    expect(screen.getByText(/1 upcoming/)).toBeTruthy();
  });

  it('shows round badge for each race', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('R1')).toBeTruthy();
  });

  it('shows Done label for past races', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('shows Upcoming label for future races', () => {
    useRaces.mockReturnValue({ races: [FUTURE_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('Upcoming')).toBeTruthy();
  });

  it('shows circuit name', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('Albert Park Circuit')).toBeTruthy();
  });

  it('opens RaceDetailModal when a past race is clicked', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    fireEvent.click(screen.getByText('Australian GP'));
    expect(screen.getByTestId('race-detail-modal')).toBeTruthy();
    expect(screen.getByText('Australian Grand Prix')).toBeTruthy();
  });

  it('closes RaceDetailModal when onClose is called', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    fireEvent.click(screen.getByText('Australian GP'));
    expect(screen.getByTestId('race-detail-modal')).toBeTruthy();
    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('race-detail-modal')).toBeNull();
  });

  it('shows empty message when no races and not loading', () => {
    useRaces.mockReturnValue({ races: [], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText(/No schedule available for 2026/)).toBeTruthy();
  });

  it('shows error message when error is set', () => {
    useRaces.mockReturnValue({ races: [], loading: false, error: 'Failed to load' });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('Failed to load')).toBeTruthy();
  });

  it('uses country flag emoji for known countries', () => {
    useRaces.mockReturnValue({ races: [PAST_RACE], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('🇦🇺')).toBeTruthy();
  });

  it('uses fallback flag for unknown countries', () => {
    const unknownCountry = { ...PAST_RACE, Circuit: { circuitName: 'Mystery Circuit', Location: { country: 'Neverland' } } };
    useRaces.mockReturnValue({ races: [unknownCountry], loading: false, error: null });
    render(<RacesSection year={2026} />);
    expect(screen.getByText('🏁')).toBeTruthy();
  });
});
