const origin = 'https://make.fun/api';
const cache = new Map();
export async function getJSON(path) {
  const url = origin + path;
  const saved = cache.get(url);
  if (saved && Date.now() - saved.at < 45000) return saved.data;
  const response = await fetch(url, {headers: saved?.etag ? {'If-None-Match': saved.etag} : {}});
  if (response.status === 304 && saved) {
    saved.at = Date.now();
    return saved.data;
  }
  if (!response.ok) {
    const error = new Error(`Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  cache.set(url, {etag: response.headers.get('ETag'), data, at: Date.now()});
  return data;
}
export const listCompetitions = cursor => getJSON('/competitions?status=open' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
export const getCompetition = slug => getJSON('/competitions/' + encodeURIComponent(slug));
export const getLeaderboard = slug => getJSON('/competitions/' + encodeURIComponent(slug) + '/leaderboard');
export const getProfile = handle => getJSON('/profiles/' + encodeURIComponent(handle));
