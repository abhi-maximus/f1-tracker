import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RaceDetailModal from './RaceDetailModal';

vi.mock('../hooks/useRaceDetail', () => ({ useRaceDetail: vi.fn() }));

import { useRaceDetail } from '../hooks/useRaceDetail';

const MOCK_RACE = {
  round: '1',
  raceName: 'Australian Grand Prix',
  date: '2026-03-15',
  Circuit: { circuitName: 'Albert Park Circuit', Location: { country: 'Australia' } },
};

const MOCK_RESULTS = [
  { driverId: 'norris', permanentNumber: '4', givenName: 'Lando', familyName: 'Norris', constructorId: 'mclaren', status: 'Finished', points: 25, position: 1, positionText: '1', lapsCompleted: 57, time: '1:30:00' },
  { driverId: 'piastri', permanentNumber: '81', givenName: 'Oscar', familyName: 'Piastri', constructorId: 'mclaren', status: 'Finished', points: 18, position: 2, positionText: '2', lapsCompleted: 57, time: '+5.123' },
  { driverId: 'hamilton', permanentNumber: '44', givenName: 'Lewis', familyName: 'Hamilton', constructorId: 'ferrari', status: 'Accident', points: 0, position: null, positionText: 'R', lapsCompleted: 30, time: null },
];

const MOCK_QUALIFYING = [
  { position: 1, driverId: 'norris', permanentNumber: '4', givenName: 'Lando', familyName: 'Norris', constructorId: 'mclaren', q1: '1:15.0', q2: '1:14.0', q3: '1:13.0' },
  { position: 2, driverId: 'piastri', permanentNumber: '81', givenName: 'Oscar', familyName: 'Piastri', constructorId: 'mclaren', q1: '1:15.1', q2: '1:14.1', q3: '1:13.1' },
  { position: 20, driverId: 'stroll', permanentNumber: '18', givenName: 'Lance', familyName: 'Stroll', constructorId: 'aston_martin', q1: '1:17.0', q2: null, q3: null },
];

beforeEach(() => vi.clearAllMocks());

describe('RaceDetailModal', () => {
  it('renders race name in header', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('Australian Grand Prix')).toBeTruthy();
  });

  it('renders round number', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('Round 1')).toBeTruthy();
  });

  it('renders circuit name', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('Albert Park Circuit')).toBeTruthy();
  });

  it('renders country flag', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('🇦🇺')).toBeTruthy();
  });

  it('shows loading skeletons when loading', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: true, error: null });
    const { container } = render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows winner badge for P1 in race results', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: MOCK_RESULTS, loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('Winner')).toBeTruthy();
  });

  it('shows 🔴 emoji for DNF', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: MOCK_RESULTS, loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('🔴')).toBeTruthy();
  });

  it('shows DNF status text', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: MOCK_RESULTS, loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('Accident')).toBeTruthy();
  });

  it('shows podium emojis for P2 and P3', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: MOCK_RESULTS, loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('🥇')).toBeTruthy();
    expect(screen.getByText('🥈')).toBeTruthy();
  });

  it('calls onClose when close button clicked', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    const onClose = vi.fn();
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key pressed', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    const onClose = vi.fn();
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    const onClose = vi.fn();
    const { container } = render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={onClose} />);
    fireEvent.click(container.querySelector('.absolute.inset-0'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows "No race data available" when results empty', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('No race data available.')).toBeTruthy();
  });

  it('switches to qualifying tab and shows pole badge', () => {
    useRaceDetail.mockReturnValue({ qualifying: MOCK_QUALIFYING, results: MOCK_RESULTS, loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    fireEvent.click(screen.getByText('⏱ Qualifying'));
    // Pole driver should appear
    expect(screen.getAllByText('L. Norris').length).toBeGreaterThan(0);
  });

  it('shows "No qualifying data available" when qualifying empty and on that tab', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    fireEvent.click(screen.getByText('⏱ Qualifying'));
    expect(screen.getByText('No qualifying data available.')).toBeTruthy();
  });

  it('shows Q3 time for drivers who reached Q3', () => {
    useRaceDetail.mockReturnValue({ qualifying: MOCK_QUALIFYING, results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    fireEvent.click(screen.getByText('⏱ Qualifying'));
    expect(screen.getByText('1:13.0')).toBeTruthy();
  });

  it('falls back to Q1 time when Q2/Q3 not set', () => {
    useRaceDetail.mockReturnValue({ qualifying: MOCK_QUALIFYING, results: [], loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    fireEvent.click(screen.getByText('⏱ Qualifying'));
    expect(screen.getByText('1:17.0')).toBeTruthy();
  });

  it('renders driver names in results', () => {
    useRaceDetail.mockReturnValue({ qualifying: [], results: MOCK_RESULTS, loading: false, error: null });
    render(<RaceDetailModal race={MOCK_RACE} year={2026} onClose={() => {}} />);
    expect(screen.getByText('L. Norris')).toBeTruthy();
    expect(screen.getByText('O. Piastri')).toBeTruthy();
    expect(screen.getByText('L. Hamilton')).toBeTruthy();
  });
});
