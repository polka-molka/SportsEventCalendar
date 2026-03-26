// Shared frontend API helper so request configuration lives in one place.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function formatErrorDetail(detail, fallbackMessage) {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object') {
          const location = Array.isArray(item.loc) ? item.loc.join(' -> ') : 'request';
          const message = item.msg || JSON.stringify(item);
          return `${location}: ${message}`;
        }

        return String(item);
      })
      .join('; ');
  }

  if (detail && typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return fallbackMessage;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      // Prefer backend validation messages when they are available.
      const payload = await response.json();
      message = formatErrorDetail(payload.detail, message);
    } catch (error) {
      // Ignore JSON parsing errors and keep the fallback message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchEvents() {
  return request('/events');
}

export function fetchSports() {
  return request('/sports');
}

export function fetchVenues() {
  return request('/venues');
}

export function fetchTeams(sportId) {
  return request(`/teams?sport_id=${sportId}`);
}

export function createEvent(payload) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
