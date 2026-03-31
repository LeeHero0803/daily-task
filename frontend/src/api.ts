import type { Todo, RecurringEvent } from './types';

const BASE = '/api';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const todosApi = {
  getAll: () => req<{ items: Todo[] }>(`${BASE}/todos`).then(d => d.items),
  create: (todo: Omit<Todo, 'id' | 'created'>) =>
    req<Todo>(`${BASE}/todos`, { method: 'POST', body: JSON.stringify(todo) }),
  update: (id: string, data: Partial<Todo>) =>
    req<Todo>(`${BASE}/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    req<void>(`${BASE}/todos/${id}`, { method: 'DELETE' }),
};

export const recurringApi = {
  getAll: () => req<{ items: RecurringEvent[] }>(`${BASE}/recurring`).then(d => d.items),
  create: (event: Omit<RecurringEvent, 'id'>) =>
    req<RecurringEvent>(`${BASE}/recurring`, { method: 'POST', body: JSON.stringify(event) }),
  update: (id: string, data: Partial<RecurringEvent>) =>
    req<RecurringEvent>(`${BASE}/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    req<void>(`${BASE}/recurring/${id}`, { method: 'DELETE' }),
};
