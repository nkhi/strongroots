import type { Vlog } from '../types';

export async function getVlog(baseUrl: string, weekStartDate: string): Promise<Vlog | null> {
  const response = await fetch(`${baseUrl}/vlogs/${weekStartDate}`);
  if (!response.ok) throw new Error('Failed to fetch vlog');
  return response.json();
}

export async function saveVlog(baseUrl: string, vlog: Vlog): Promise<void> {
  const response = await fetch(`${baseUrl}/vlogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vlog)
  });
  if (!response.ok) throw new Error('Failed to save vlog');
}
