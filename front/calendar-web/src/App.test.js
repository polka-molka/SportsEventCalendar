// Frontend smoke tests for the main event dashboard workflow.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const eventsResponse = [
  {
    id_event: 1,
    datetime: '2026-03-26T18:30:00',
    status: 'Finished',
    description: 'League Match',
    sport_name: 'Football',
    venue_name: 'Red Bull Arena',
    city: 'Salzburg',
    match_name: 'Austrian Summer League Finals',
    competitors: [
      { team_name: 'Salzburg', role: 'Home', score: 2 },
      { team_name: 'Sturm Graz', role: 'Away', score: 1 },
    ],
  },
  {
    id_event: 2,
    datetime: '2026-03-27T20:00:00',
    status: 'Scheduled',
    description: 'Championship Game',
    sport_name: 'Ice Hockey',
    venue_name: 'Eisstadion Graz Liebenau',
    city: 'Graz',
    match_name: 'Annual Winter Championship',
    competitors: [
      { team_name: 'KAC', role: 'Home', score: null },
      { team_name: 'Capitals', role: 'Away', score: null },
    ],
  },
];

beforeEach(() => {
  // Mock every network request the app can make during the tests.
  global.fetch = jest.fn((url, options) => {
    if (url.endsWith('/events') && (!options || options.method === undefined)) {
      return Promise.resolve({
        ok: true,
        json: async () => eventsResponse,
      });
    }

    if (url.endsWith('/sports')) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ id_sport: 1, sport_name: 'Football' }],
      });
    }

    if (url.endsWith('/venues')) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ id_venue: 1, venue_name: 'Red Bull Arena', city: 'Salzburg' }],
      });
    }

    if (url.includes('/teams?sport_id=')) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ id_team: 1, team_name: 'Salzburg', _id_sport: 1 }],
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({ status: 'success', id: 3 }),
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders fetched events and allows filtering by sport', async () => {
  render(<App />);

  expect(screen.getByText(/loading events/i)).toBeInTheDocument();

  expect(await screen.findByText(/Austrian Summer League Finals/i)).toBeInTheDocument();
  expect(screen.getByText(/Annual Winter Championship/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'Football' } });

  await waitFor(() => {
    expect(screen.getByText(/Austrian Summer League Finals/i)).toBeInTheDocument();
    expect(screen.queryByText(/Annual Winter Championship/i)).not.toBeInTheDocument();
  });
});

test('opens the modal and loads reference data', async () => {
  render(<App />);

  await screen.findByText(/Austrian Summer League Finals/i);

  fireEvent.click(screen.getByRole('button', { name: /add event/i }));

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: /create new event/i })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/sports', expect.any(Object));
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/venues', expect.any(Object));
});
