/**
 * Diary API
 *
 * REST wrappers + TanStack Query hooks for diary/journal endpoints.
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
import type { Question, DiaryEntry, DiaryByQuestion } from '../types';
import { fetchWithErrorReporting } from './errorReporter';
import { API_BASE_URL } from '../config';
import { queryKeys } from './queryKeys';

// ============ REST API Functions ============

export async function getQuestions(): Promise<Question[]> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/questions`);
  if (!response.ok) throw new Error('Failed to fetch questions');
  return response.json();
}

export async function saveQuestion(question: Question): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question)
  });
  if (!response.ok) throw new Error('Failed to save question');
}

export async function getDiary(): Promise<Record<string, DiaryEntry[]>> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/diary`);
  if (!response.ok) throw new Error('Failed to fetch diary');
  return response.json();
}

export async function createDiaryEntry(entry: DiaryEntry): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/diary-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to create diary entry');
}

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/diary-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to save diary entry');
}

export async function updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/diary-entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update diary entry');
  return response.json();
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const response = await fetchWithErrorReporting(`${API_BASE_URL}/diary-entries/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete diary entry');
}

export async function getDiaryByQuestion(): Promise<DiaryByQuestion[]> {
  const [questions, diary] = await Promise.all([
    getQuestions(),
    getDiary()
  ]);

  const allEntries = Object.values(diary).flat();

  return questions.map(question => ({
    question,
    entries: allEntries
      .filter(e => e.questionId === question.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }));
}

// ============ TanStack Query Hooks ============

export function useQuestions() {
  return useQuery({
    queryKey: queryKeys.diary.questions(),
    queryFn: getQuestions,
  });
}

export function useDiary() {
  return useQuery({
    queryKey: queryKeys.diary.entries(),
    queryFn: getDiary,
  });
}

export function useDiaryByQuestion() {
  return useQuery({
    queryKey: queryKeys.diary.byQuestion(),
    queryFn: getDiaryByQuestion,
  });
}

export function useSaveQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveQuestion,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.diary.all }),
  });
}

export function useSaveDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveDiaryEntry,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.diary.all }),
  });
}

export function useUpdateDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DiaryEntry> }) =>
      updateDiaryEntry(id, updates),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.diary.all }),
  });
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDiaryEntry,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.diary.all }),
  });
}
