/**
 * Notes API
 *
 * REST wrappers + TanStack Query hooks for notes endpoints.
 *
 * STRUCTURE:
 *   1. Raw fetch functions (get*, create*, update*, delete*)
 *   2. TanStack Query hooks (use* for queries, use*Mutation for mutations)
 *
 * TO ADD A NEW ENDPOINT:
 *   1. Add the fetch function (use fetchWithErrorReporting)
 *   2. Add a query key to queryKeys.ts if it's a GET
 *   3. Add the corresponding useQuery/useMutation hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note } from '../types';
import { fetchWithErrorReporting } from './errorReporter';
import { API_BASE_URL } from '../config';
import { queryKeys } from './queryKeys';

// ============ REST API Functions ============

export async function getNotes(): Promise<Note[]> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/next`);
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function createNote(note: Partial<Note>): Promise<Note> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/next/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}

// ============ TanStack Query Hooks ============

export function useNotes() {
  return useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: getNotes,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notes.all }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Note> }) =>
      updateNote(id, updates),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notes.all }),
  });
}
