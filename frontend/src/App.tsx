import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Todo, RecurringEvent } from './types';
import { todosApi, recurringApi } from './api';
import Header from './components/Header';
import TodoView from './components/TodoView';
import RecurringView from './components/RecurringView';
import CalendarView from './components/CalendarView';

type Tab = 'todos' | 'recurring' | 'calendar';

export default function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved === 'todos' || saved === 'recurring' || saved === 'calendar') ? saved : 'todos';
  });
  const handleTabChange = (t: Tab) => { setTab(t); localStorage.setItem('activeTab', t); };
  const [todos, setTodos] = useState<Todo[]>([]);
  const [recurring, setRecurring] = useState<RecurringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDark = () => setDarkMode(v => !v);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, r] = await Promise.all([todosApi.getAll(), recurringApi.getAll()]);
      setTodos(t);
      setRecurring(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    todos.forEach(t => t.tags.forEach(tag => set.add(tag)));
    recurring.forEach(r => r.tags.forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [todos, recurring]);

  return (
    <div className="min-h-screen bg-paper">
      <Header tab={tab} onTabChange={handleTabChange} darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="max-w-screen-xl mx-auto px-4">
        {loading ? (
          <div className="py-16 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
            LOADING...
          </div>
        ) : tab === 'todos' ? (
          <TodoView todos={todos} allTags={allTags} onRefresh={loadData} />
        ) : tab === 'recurring' ? (
          <RecurringView events={recurring} allTags={allTags} onRefresh={loadData} />
        ) : (
          <CalendarView todos={todos} events={recurring} />
        )}
      </main>
      <footer className="border-t border-ink mt-16 py-4 px-4 max-w-screen-xl mx-auto">
        <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest text-center">
          THE DAILY TASK — LOCAL EDITION — DATA STORED LOCALLY
        </p>
      </footer>
    </div>
  );
}
