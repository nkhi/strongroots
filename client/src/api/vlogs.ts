import type { Vlog, VlogsByWeek } from '../types';
import { fetchWithErrorReporting } from './errorReporter';

export async function getVlog(baseUrl: string, weekStartDate: string): Promise<Vlog | null> {
  const response = await fetchWithErrorReporting(`${baseUrl}/vlogs/${weekStartDate}`);
  if (!response.ok) throw new Error('Failed to fetch vlog');
  return response.json();
}

export async function getVlogsBatch(baseUrl: string, weekStartDates: string[]): Promise<VlogsByWeek> {
  if (weekStartDates.length === 0) return {};
  
  const response = await fetchWithErrorReporting(`${baseUrl}/vlogs/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStartDates })
  });
  if (!response.ok) throw new Error('Failed to fetch vlogs batch');
  return response.json();
}

export async function saveVlog(baseUrl: string, vlog: Vlog): Promise<void> {
  const response = await fetchWithErrorReporting(`${baseUrl}/vlogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vlog)
  });
  if (!response.ok) throw new Error('Failed to save vlog');
}
