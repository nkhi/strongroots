/**
 * Lists API
 *
 * REST wrappers + TanStack Query hooks for lists endpoints.
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
import type { List } from '../types';
import { fetchWithErrorReporting } from './errorReporter';
import { API_BASE_URL } from '../config';
import { queryKeys } from './queryKeys';

// ============ REST API Functions ============

export async function getLists(): Promise<List[]> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists`);
  if (!response.ok) throw new Error('Failed to fetch lists');
  return response.json();
}

export async function createList(list: Partial<List>): Promise<List> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list)
  });
  if (!response.ok) throw new Error('Failed to create list');
  return response.json();
}

export async function updateList(id: string, updates: Partial<List>): Promise<List> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update list');
  return response.json();
}

export async function deleteList(id: string): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete list');
}

export async function reorderList(id: string, order: string): Promise<List> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists/${id}/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order })
  });
  if (!response.ok) throw new Error('Failed to reorder list');
  return response.json();
}

export async function reorderListItems(listId: string, itemOrder: string[]): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists/${listId}/reorder-items`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemOrder })
  });
  if (!response.ok) throw new Error('Failed to reorder list items');
}

export async function reorderLists(listOrder: string[]): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/lists/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listOrder })
  });
  if (!response.ok) throw new Error('Failed to reorder lists');
}

// ============ TanStack Query Hooks ============

export function useLists() {
  return useQuery({
    queryKey: queryKeys.lists.all,
    queryFn: getLists,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createList,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<List> }) =>
      updateList(id, updates),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteList,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
}

export function useReorderLists() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorderLists,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
}

export function useReorderListItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemOrder }: { listId: string; itemOrder: string[] }) =>
      reorderListItems(listId, itemOrder),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.lists.all }),
  });
}
