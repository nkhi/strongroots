import type { Memory, CreateMemoryRequest } from '../types';
import { fetchWithErrorReporting } from './errorReporter';
import { API_BASE_URL } from '../config';

export async function getMemories(from: string, to: string): Promise<Memory[]> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/memories?from=${from}&to=${to}`);
  if (!response.ok) throw new Error('Failed to fetch memories');
  return response.json();
}

export async function createMemory(memory: CreateMemoryRequest): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory)
  });
  if (!response.ok) throw new Error('Failed to create memory');
}
