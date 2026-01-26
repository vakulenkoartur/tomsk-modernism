export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function readError(response) {
  try {
    const data = await response.json();
    if (data && data.error) return data.error;
  } catch {
    // ignore parse errors
  }
  return `Request failed: ${response.status}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiGet(path) {
  const response = await request(path);
  return parseResponse(response);
}

export async function apiForm(path, method, formData) {
  const response = await request(path, { method, body: formData });
  return parseResponse(response);
}

export async function apiDelete(path) {
  const response = await request(path, { method: 'DELETE' });
  return parseResponse(response);
}
