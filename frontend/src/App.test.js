import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the global fetch function
global.fetch = jest.fn();

const mockEvents = [
  {
    id: 1,
    name: 'Clemson vs. FSU',
    date: '2024-09-23T18:00:00Z',
    tickets_total: 200,
    tickets_sold: 100,
  },
  {
    id: 2,
    name: 'Concert in the Brooks Center',
    date: '2024-10-15T20:00:00Z',
    tickets_total: 50,
    tickets_sold: 25,
  },
];

// Use fake timers to control setTimeout
jest.useFakeTimers();

beforeEach(() => {
  fetch.mockClear();
});

test('renders TigerTix header', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  await act(async () => {
    render(<App />);
  });

  const headerElement = await screen.findByText(/TigerTix/i);
  expect(headerElement).toBeInTheDocument();
});

test('fetches and displays events on initial render', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockEvents,
  });

  await act(async () => {
    render(<App />);
  });

  // Wait for events to be displayed
  expect(await screen.findByText('Clemson vs. FSU')).toBeInTheDocument();
  expect(screen.getByText('Concert in the Brooks Center')).toBeInTheDocument();

  // Check if fetch was called correctly
  expect(fetch).toHaveBeenCalledWith('/api/events');
});

test('handles ticket purchase, shows success message, then clears it', async () => {
  // Mock fetching events
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockEvents,
  });

  await act(async () => {
    render(<App />);
  });

  const purchaseButton = await screen.findByRole('button', {
    name: /buy ticket for Clemson vs. FSU/i,
  });

  // Mock the purchase API call
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      message: 'Purchase successful!',
      event: {
        ...mockEvents[0],
        tickets_sold: mockEvents[0].tickets_sold + 1,
      },
    }),
  });

  await act(async () => {
    fireEvent.click(purchaseButton);
  });

  const successMessage = await screen.findByText('Purchase successful!');
  expect(successMessage).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('/api/events/1/purchase', { method: 'POST' });

  // Wrap the timer advancement in act() too
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });

  await waitFor(() => {
    expect(screen.queryByText('Purchase successful!')).not.toBeInTheDocument();
  });
});
