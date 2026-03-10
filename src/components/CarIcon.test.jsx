import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CarIcon from './CarIcon';

describe('CarIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<CarIcon teamId="ferrari" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('applies aria-label with teamId', () => {
    const { container } = render(<CarIcon teamId="ferrari" />);
    expect(container.querySelector('svg').getAttribute('aria-label')).toBe('ferrari F1 car');
  });

  it('applies custom className', () => {
    const { container } = render(<CarIcon teamId="ferrari" className="w-full h-20" />);
    expect(container.querySelector('svg').classList.contains('w-full')).toBe(true);
    expect(container.querySelector('svg').classList.contains('h-20')).toBe(true);
  });

  it('renders label text for ferrari (SF)', () => {
    const { container } = render(<CarIcon teamId="ferrari" />);
    const text = container.querySelector('text');
    expect(text.textContent).toBe('SF');
  });

  it('renders label text for red_bull (RBR)', () => {
    const { container } = render(<CarIcon teamId="red_bull" />);
    const text = container.querySelector('text');
    expect(text.textContent).toBe('RBR');
  });

  it('resolves alphatauri alias to rb livery', () => {
    const { container: at } = render(<CarIcon teamId="alphatauri" />);
    const { container: rb } = render(<CarIcon teamId="rb" />);
    // Both should render the same label (RB)
    expect(at.querySelector('text').textContent).toBe('RB');
    expect(rb.querySelector('text').textContent).toBe('RB');
  });

  it('resolves audi alias to sauber livery (AUDI label)', () => {
    const { container } = render(<CarIcon teamId="audi" />);
    expect(container.querySelector('text').textContent).toBe('AUDI');
  });

  it('resolves kick_sauber alias to sauber', () => {
    const { container } = render(<CarIcon teamId="kick_sauber" />);
    expect(container.querySelector('text').textContent).toBe('AUDI');
  });

  it('resolves alfa alias to sauber', () => {
    const { container } = render(<CarIcon teamId="alfa" />);
    expect(container.querySelector('text').textContent).toBe('AUDI');
  });

  it('resolves cadillac alias to haas livery', () => {
    const { container } = render(<CarIcon teamId="cadillac" />);
    expect(container.querySelector('text').textContent).toBe('HAAS');
  });

  it('uses fallback gray livery for unknown teamId', () => {
    // Should not throw, just render with fallback
    const { container } = render(<CarIcon teamId="unknown_xyz" />);
    expect(container.querySelector('svg')).toBeTruthy();
    // Label should be first 4 chars uppercased
    expect(container.querySelector('text').textContent).toBe('UNKN');
  });

  it('handles undefined teamId gracefully', () => {
    const { container } = render(<CarIcon teamId={undefined} />);
    expect(container.querySelector('svg')).toBeTruthy();
    // Empty string teamId → label is ''
    expect(container.querySelector('text').textContent).toBe('');
  });

  it('renders all major teams without error', () => {
    const teams = ['red_bull', 'ferrari', 'mercedes', 'mclaren', 'aston_martin',
                   'alpine', 'haas', 'rb', 'williams', 'sauber'];
    teams.forEach((id) => {
      const { container } = render(<CarIcon teamId={id} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
