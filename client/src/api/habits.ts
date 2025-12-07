import type { Habit, HabitEntry } from '../types';

export async function getHabits(baseUrl: string): Promise<Habit[]> {
  const response = await fetch(`${baseUrl}/habits`);
  if (!response.ok) throw new Error('Failed to fetch habits');
  return response.json();
}

export async function getEntries(baseUrl: string, from: string, to: string): Promise<HabitEntry[]> {
  const response = await fetch(`${baseUrl}/habit-entries?from=${from}&to=${to}`);
  if (!response.ok) throw new Error('Failed to fetch entries');
  return response.json();
}

export async function saveEntry(baseUrl: string, entry: Partial<HabitEntry>): Promise<void> {
  const response = await fetch(`${baseUrl}/habit-entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to save entry');
}
