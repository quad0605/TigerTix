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
test("user can log in successfully", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockEvents,
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: "FAKE_JWT" }),
  });

  await act(async () => {
    render(<App />);
  });

  // Fill login form
  fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter Password"), {
    target: { value: "secret123" },
  });

  fireEvent.click(screen.getByText("Submit"));

  // Popup disappears
  await waitFor(() =>
    expect(screen.queryByText("Login")).not.toBeInTheDocument()
  );

  expect(fetch).toHaveBeenNthCalledWith(
    2,
    "http://localhost:4000/api/auth/login",
    expect.objectContaining({
      method: "POST",
      credentials: "include",
    })
  );

  expect(fetch).toHaveBeenCalledTimes(2);
});


test("user logs in and successfully purchases a ticket", async () => {


  const eventBefore = {
    id: 1,
    name: "Cool Event",
    tickets_total: 10,
    tickets_sold: 1,
    date: "2025-01-01T12:00:00Z"
  };

  const eventAfter = {
    id: 1,
    name: "Cool Event",
    tickets_total: 10,
    tickets_sold: 2,
    date: "2025-01-01T12:00:00Z"
  };

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [eventBefore],
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: "FAKE_JWT" }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      event: eventAfter,
      message: "Purchase successful",
    }),
  });

  await act(async () => {
    render(<App />);
  });

  // Log the user in
  fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
    target: { value: "test@example.com" },
  });

  fireEvent.change(screen.getByPlaceholderText("Enter Password"), {
    target: { value: "secret123" },
  });

  fireEvent.click(screen.getByText("Submit"));

  // Login popup disappears
  await waitFor(() =>
    expect(screen.queryByText("Login")).not.toBeInTheDocument()
  );

  const buyButton = screen.getByRole('button', { name: /Buy Ticket/i });
  expect(buyButton).toHaveClass('buy');
  fireEvent.click(buyButton);



  // Expect POST purchase call
  expect(fetch).toHaveBeenNthCalledWith(
    3, // purchase is the 3rd request
    "http://localhost:6001/api/events/1/purchase",
    expect.objectContaining({
      method: "POST",
      credentials: "include",
    })
  );

  // Confirmation message should appear
  await waitFor(() =>
    expect(screen.getByText("Purchase successful")).toBeInTheDocument()
  );

  // Tickets should show the updated value
  const eventCard = screen.getByText("Cool Event").closest("li");
  expect(eventCard).toHaveTextContent("Tickets available: 8");

});
