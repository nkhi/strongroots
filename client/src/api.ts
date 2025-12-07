import type { HabitEntry, Vlog } from './types';
import * as habits from './api/habits';
import * as tasks from './api/tasks';
import * as diary from './api/diary';
import * as vlogs from './api/vlogs';
import * as next from './api/next';
import * as lists from './api/lists';

export class HabitAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Habits
  getHabits() { return habits.getHabits(this.baseUrl); }
  getEntries(from: string, to: string) { return habits.getEntries(this.baseUrl, from, to); }
  saveEntry(entry: Partial<HabitEntry>) { return habits.saveEntry(this.baseUrl, entry); }

  // Vlogs
  getVlog(weekStartDate: string) { return vlogs.getVlog(this.baseUrl, weekStartDate); }
  saveVlog(vlog: Vlog) { return vlogs.saveVlog(this.baseUrl, vlog); }

  // Tasks
  getTasks() { return tasks.getTasks(this.baseUrl); }
  getTasksForWeek(start: string, end: string) { return tasks.getTasksForWeek(this.baseUrl, start, end); }
  createTask(task: import('./types').Task) { return tasks.createTask(this.baseUrl, task); }
  updateTask(id: string, updates: Partial<import('./types').Task>) { return tasks.updateTask(this.baseUrl, id, updates); }
  deleteTask(id: string) { return tasks.deleteTask(this.baseUrl, id); }

  // Diary
  getQuestions() { return diary.getQuestions(this.baseUrl); }
  saveQuestion(question: import('./types').Question) { return diary.saveQuestion(this.baseUrl, question); }
  getDiary() { return diary.getDiary(this.baseUrl); }
  createDiaryEntry(entry: import('./types').DiaryEntry) { return diary.createDiaryEntry(this.baseUrl, entry); }
  saveDiaryEntry(entry: import('./types').DiaryEntry) { return diary.saveDiaryEntry(this.baseUrl, entry); }
  updateDiaryEntry(id: string, updates: Partial<import('./types').DiaryEntry>) { return diary.updateDiaryEntry(this.baseUrl, id, updates); }
  deleteDiaryEntry(id: string) { return diary.deleteDiaryEntry(this.baseUrl, id); }
  getDiaryByQuestion() { return diary.getDiaryByQuestion(this.baseUrl); }

  // Next
  getNotes() { return next.getNotes(this.baseUrl); }
  createNote(note: Partial<import('./types').Note>) { return next.createNote(this.baseUrl, note); }
  updateNote(id: string, updates: Partial<import('./types').Note>) { return next.updateNote(this.baseUrl, id, updates); }

  // Lists
  getLists() { return lists.getLists(this.baseUrl); }
  createList(list: Partial<import('./types').List>) { return lists.createList(this.baseUrl, list); }
  updateList(id: string, updates: Partial<import('./types').List>) { return lists.updateList(this.baseUrl, id, updates); }
  deleteList(id: string) { return lists.deleteList(this.baseUrl, id); }
}
