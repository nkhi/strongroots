/**
 * Vlogs API
 *
 * REST wrappers + TanStack Query hooks for weekly vlog endpoints.
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
import type { Vlog, VlogsByWeek } from '../types';
import { fetchWithErrorReporting } from './errorReporter';
import { API_BASE_URL } from '../config';
import { queryKeys } from './queryKeys';

// ============ REST API Functions ============

export async function getVlog(weekStartDate: string): Promise<Vlog | null> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/vlogs/${weekStartDate}`);
  if (!response.ok) throw new Error('Failed to fetch vlog');
  return response.json();
}

export async function getVlogsBatch(weekStartDates: string[]): Promise<VlogsByWeek> {
  if (weekStartDates.length === 0) return {};

  const response = await fetchWithErrorReporting(`${API_BASE_URL}/vlogs/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStartDates })
  });
  if (!response.ok) throw new Error('Failed to fetch vlogs batch');
  return response.json();
}

export async function saveVlog(vlog: Vlog): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/vlogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vlog)
  });
  if (!response.ok) throw new Error('Failed to save vlog');
}

// ============ TanStack Query Hooks ============

export function useVlog(weekStartDate: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.vlogs.single(weekStartDate),
    queryFn: () => getVlog(weekStartDate),
    enabled,
  });
}

export function useVlogsBatch(weekStartDates: string[]) {
  return useQuery({
    queryKey: queryKeys.vlogs.batch(weekStartDates),
    queryFn: () => getVlogsBatch(weekStartDates),
    enabled: weekStartDates.length > 0,
  });
}

export function useSaveVlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveVlog,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.vlogs.all }),
  });
}
