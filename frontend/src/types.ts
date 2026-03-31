export interface Todo {
  id: string;
  title: string;
  due: string | null;
  tags: string[];
  done: boolean;
  created: string;
}

export interface RecurringEvent {
  id: string;
  title: string;
  recurrence: 'yearly' | 'monthly' | 'weekly';
  date: string;
  tags: string[];
  notes: string;
  remind_days_before: number;
}
