import type { Question, DiaryEntry, DiaryByQuestion } from '../types';

export async function getQuestions(baseUrl: string): Promise<Question[]> {
  const response = await fetch(`${baseUrl}/questions`);
  if (!response.ok) throw new Error('Failed to fetch questions');
  return response.json();
}

export async function saveQuestion(baseUrl: string, question: Question): Promise<void> {
  const response = await fetch(`${baseUrl}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question)
  });
  if (!response.ok) throw new Error('Failed to save question');
}

export async function getDiary(baseUrl: string): Promise<Record<string, DiaryEntry[]>> {
  const response = await fetch(`${baseUrl}/diary`);
  if (!response.ok) throw new Error('Failed to fetch diary');
  return response.json();
}

export async function createDiaryEntry(baseUrl: string, entry: DiaryEntry): Promise<void> {
  const response = await fetch(`${baseUrl}/diary-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to create diary entry');
}

export async function saveDiaryEntry(baseUrl: string, entry: DiaryEntry): Promise<void> {
  const response = await fetch(`${baseUrl}/diary-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to save diary entry');
}

export async function updateDiaryEntry(baseUrl: string, id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
  const response = await fetch(`${baseUrl}/diary-entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update diary entry');
  return response.json();
}

export async function deleteDiaryEntry(baseUrl: string, id: string): Promise<void> {
  const response = await fetch(`${baseUrl}/diary-entries/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete diary entry');
}

export async function getDiaryByQuestion(baseUrl: string): Promise<DiaryByQuestion[]> {
  const [questions, diary] = await Promise.all([
    getQuestions(baseUrl),
    getDiary(baseUrl)
  ]);

  // diary is Record<string, DiaryEntry[]> (keyed by date)
  const allEntries = Object.values(diary).flat();

  return questions.map(question => ({
    question,
    entries: allEntries
      .filter(e => e.questionId === question.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }));
}
