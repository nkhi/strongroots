import type { Note } from '../types';
import { fetchWithErrorReporting } from './errorReporter';

export async function getNotes(baseUrl: string): Promise<Note[]> {
  const response = await fetchWithErrorReporting(`${baseUrl}/next`);
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function createNote(baseUrl: string, note: Partial<Note>): Promise<Note> {
  const response = await fetchWithErrorReporting(`${baseUrl}/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function updateNote(baseUrl: string, id: string, updates: Partial<Note>): Promise<Note> {
  const response = await fetchWithErrorReporting(`${baseUrl}/next/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}
