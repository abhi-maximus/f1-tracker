const BASE_URL = '/openf1/v1';

async function fetchJson(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenF1 API error: ${res.status}`);
  return res.json();
}

export async function getSessions(year = 2026) {
  return fetchJson('/sessions', { year, session_type: 'Race' });
}

export async function getDrivers(sessionKey) {
  return fetchJson('/drivers', { session_key: sessionKey });
}

export async function getLaps(sessionKey, driverNumber) {
  return fetchJson('/laps', { session_key: sessionKey, driver_number: driverNumber });
}

export async function getPitStops(sessionKey) {
  return fetchJson('/pit', { session_key: sessionKey });
}

export async function getRaceControl(sessionKey) {
  return fetchJson('/race_control', { session_key: sessionKey });
}

export async function getStints(sessionKey) {
  return fetchJson('/stints', { session_key: sessionKey });
}

export async function getPosition(sessionKey) {
  return fetchJson('/position', { session_key: sessionKey });
}
