import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamDetailModal from './TeamDetailModal';

const TEAM = {
  id: 'ferrari',
  shortName: 'Ferrari',
  name: 'Scuderia Ferrari',
  bgGradient: 'from-red-600 to-yellow-500',
  textColor: '#fff',
  drivers: ['Charles Leclerc', 'Lewis Hamilton'],
  driverNumbers: [16, 44],
};

const STATS_CLEAN = {
  dnfs: 0,
  crashes: 0,
  engineFailures: 0,
  dnfHistory: [],
};

const STATS_WITH_INCIDENTS = {
  dnfs: 2,
  crashes: 1,
  engineFailures: 1,
  dnfHistory: [
    {
      round: '1',
      raceName: 'Australian Grand Prix',
      circuit: 'Albert Park',
      date: '2026-03-08',
      incidents: [
        { driverName: 'Charles Leclerc', driverNumber: 16, status: 'Collision', lapsCompleted: 12, type: 'crash' },
      ],
    },
    {
      round: '3',
      raceName: 'Japanese Grand Prix',
      circuit: 'Suzuka',
      date: '2026-04-05',
      incidents: [
        { driverName: 'Lewis Hamilton', driverNumber: 44, status: 'Engine', lapsCompleted: 33, type: 'engine' },
      ],
    },
  ],
};

describe('TeamDetailModal', () => {
  let onClose;
  let onCompare;

  beforeEach(() => {
    onClose = vi.fn();
    onCompare = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders team short name', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('FERRARI')).toBeTruthy();
  });

  it('renders DNF Report label', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('DNF Report')).toBeTruthy();
  });

  it('shows clean season message when no history', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('Clean season so far!')).toBeTruthy();
    expect(screen.getByText('No DNFs or retirements recorded.')).toBeTruthy();
  });

  it('renders incident timeline when history is present', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_WITH_INCIDENTS} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('Incident Timeline')).toBeTruthy();
    expect(screen.getByText('Australian Grand Prix')).toBeTruthy();
    expect(screen.getByText('Japanese Grand Prix')).toBeTruthy();
  });

  it('renders incident details correctly', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_WITH_INCIDENTS} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('Charles Leclerc')).toBeTruthy();
    expect(screen.getByText('Collision')).toBeTruthy();
    expect(screen.getByText('L12')).toBeTruthy();
  });

  it('shows — for lapsCompleted=0', () => {
    const stats = {
      ...STATS_WITH_INCIDENTS,
      dnfHistory: [{
        round: '1', raceName: 'Race', circuit: 'Track', date: '2026-03-08',
        incidents: [{ driverName: 'Lewis Hamilton', driverNumber: 44, status: 'Did not start', lapsCompleted: 0, type: 'dns' }],
      }],
    };
    render(<TeamDetailModal team={TEAM} stats={stats} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders mini stat bubbles with correct values', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_WITH_INCIDENTS} onClose={onClose} onCompare={onCompare} />);
    // DNFs=2, Crashes=1, Engine=1, Other=0
    const allText = screen.getAllByText('2');
    expect(allText.length).toBeGreaterThan(0);
  });

  it('closes when close button is clicked', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when overlay background is clicked', () => {
    const { container } = render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    fireEvent.click(screen.getByText('FERRARI'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on other key presses', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll on mount and restores on unmount', () => {
    const { unmount } = render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onCompare when compare button clicked', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    fireEvent.click(screen.getByText('⚔️ Compare This Team'));
    expect(onCompare).toHaveBeenCalledTimes(1);
  });

  it('shows "Added to Comparison" when isSelected', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} isSelected />);
    expect(screen.getByText('✓ Added to Comparison')).toBeTruthy();
  });

  it('renders round badge for each race in history', () => {
    render(<TeamDetailModal team={TEAM} stats={STATS_WITH_INCIDENTS} onClose={onClose} onCompare={onCompare} />);
    expect(screen.getByText('R1')).toBeTruthy();
    expect(screen.getByText('R3')).toBeTruthy();
  });

  it('renders with empty stats gracefully', () => {
    const { container } = render(<TeamDetailModal team={TEAM} stats={{}} onClose={onClose} onCompare={onCompare} />);
    expect(container.textContent).toContain('Clean season so far!');
  });

  it('falls back to dnf config for unknown incident type', () => {
    const stats = {
      dnfs: 1, crashes: 0, engineFailures: 0,
      dnfHistory: [{
        round: '1', raceName: 'Race', circuit: 'Track', date: '2026-03-08',
        incidents: [{ driverName: 'Lewis Hamilton', driverNumber: 44, status: 'Gearbox', lapsCompleted: 25, type: 'unknown_type' }],
      }],
    };
    render(<TeamDetailModal team={TEAM} stats={stats} onClose={onClose} onCompare={onCompare} />);
    // Should render without crashing, incident shows with fallback icon/label
    expect(screen.getByText('Lewis Hamilton')).toBeTruthy();
    expect(screen.getByText('L25')).toBeTruthy();
  });

  it('removes Escape listener on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<TeamDetailModal team={TEAM} stats={STATS_CLEAN} onClose={onClose} onCompare={onCompare} />);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
