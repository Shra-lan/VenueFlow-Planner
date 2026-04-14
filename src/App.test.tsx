import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the VenueFlow header', () => {
    render(<App />);
    expect(screen.getByText('VenueFlow')).toBeInTheDocument();
  });

  it('renders the ticket entry view by default', () => {
    render(<App />);
    expect(screen.getByText(/Find Your Seat/i)).toBeInTheDocument();
  });
});
