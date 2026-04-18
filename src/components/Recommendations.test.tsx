import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Recommendations from './Recommendations';

// Mock `global.fetch` to intercept our API calls during tests
global.fetch = vi.fn();

describe('Recommendations Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the loading skeleton initially', () => {
    // Keep the fetch unresolved
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    render(<Recommendations stand="Test Stand" />);
    
    expect(screen.getByText('Generating personalized amenities layout...')).toBeInTheDocument();
  });

  it('fetches and displays recommendations from the AI endpoint gracefully', async () => {
    const mockReponse = [
      { type: 'Utensils', title: 'Test Grill', desc: 'Mock Level 2', wait: '2 min wait' }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReponse
    });

    render(<Recommendations stand="North" />);

    // Wait for the async AI API fetch to finish and update UI
    await waitFor(() => {
      expect(screen.getByText('Test Grill')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Mock Level 2')).toBeInTheDocument();
    expect(screen.getByText('2 min wait')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/recommendations?stand=North');
  });

  it('catches API failures and safely renders fallback recommendation data', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('AI Rate Limit Exceeded'));

    render(<Recommendations stand="South" />);

    // Wait and verify the specific hardcoded fallback string occurs
    await waitFor(() => {
      expect(screen.getByText('Nearest Restroom')).toBeInTheDocument();
    });

    expect(screen.getByText('Level 1, South Concourse')).toBeInTheDocument();
  });
});
