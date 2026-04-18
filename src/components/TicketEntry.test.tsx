import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketEntry from './TicketEntry';
import { describe, it, expect, vi } from 'vitest';

describe('TicketEntry Component', () => {
  it('renders the initial UI elements', () => {
    render(<TicketEntry onTicketSubmit={vi.fn()} />);
    
    expect(screen.getByText('Find Your Seat')).toBeInTheDocument();
    expect(screen.getByText('Scan Physical Ticket')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., North_A_1_12')).toBeInTheDocument();
  });

  it('shows an error on invalid manual ticket format', () => {
    const mockSubmit = vi.fn();
    render(<TicketEntry onTicketSubmit={mockSubmit} />);
    
    const input = screen.getByPlaceholderText('e.g., North_A_1_12');
    const submitBtn = screen.getByLabelText('Submit Ticket');

    fireEvent.change(input, { target: { value: 'Invalid_Ticket_String' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Invalid format. Please use Stand_Row_Column_Seat (e.g., North_A_1_12)')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('calls onTicketSubmit with valid ticket parts', () => {
    const mockSubmit = vi.fn();
    render(<TicketEntry onTicketSubmit={mockSubmit} />);
    
    const input = screen.getByPlaceholderText('e.g., North_A_1_12');
    const submitBtn = screen.getByLabelText('Submit Ticket');

    fireEvent.change(input, { target: { value: 'South_B_12_45' } });
    fireEvent.click(submitBtn);

    expect(mockSubmit).toHaveBeenCalledWith({
      stand: 'South',
      row: 'B',
      column: '12',
      seat: '45',
      raw: 'South_B_12_45'
    });
  });
});
