import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Plus, X } from 'lucide-react';
import type { Todo } from '../types';
import { todosApi } from '../api';
import TagBadge from './TagBadge';
import TagPicker from './TagPicker';
import TodoItem from './TodoItem';

interface Props {
  todos: Todo[];
  allTags: string[];
  onRefresh: () => void;
}

const TodoView: FC<Props> = ({ todos, allTags, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Form state intentionally persists across submits
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const localTags = useMemo(() => {
    const combined = new Set([...allTags, ...selectedTags]);
    todos.forEach(t => t.tags.forEach(tag => combined.add(tag)));
    return Array.from(combined).sort();
  }, [allTags, todos, selectedTags]);

  // Filter, then sort: pending by due-date asc (no-due last), done items sink to bottom
  const filtered = useMemo(() => {
    const result = todos.filter(t => {
      if (filter === 'pending' && t.done) return false;
      if (filter === 'done' && !t.done) return false;
      if (activeTag && !t.tags.includes(activeTag)) return false;
      return true;
    });
    return result.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due && b.due) return new Date(a.due).getTime() - new Date(b.due).getTime();
      if (a.due) return -1;
      if (b.due) return 1;
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
  }, [todos, filter, activeTag]);

  const pendingCount = todos.filter(t => !t.done).length;
  const doneCount = todos.filter(t => t.done).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await todosApi.create({ title: title.trim(), due: due || null, tags: selectedTags, done: false });
      onRefresh();
      // Keep form values so the user can add similar tasks back-to-back
    } finally {
      setSubmitting(false);
    }
  };

  const filterTags = useMemo(() => {
    const set = new Set<string>();
    todos.forEach(t => t.tags.forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [todos]);

  return (
    <div className="py-8">
      {/* Stats + add button */}
      <div className="flex items-center justify-between border border-ink">
        <div className="flex divide-x divide-ink">
          <div className="px-6 py-3 text-center">
            <div className="font-mono text-2xl font-bold text-ink">{todos.length}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Total</div>
          </div>
          <div className="px-6 py-3 text-center">
            <div className="font-mono text-2xl font-bold text-accent">{pendingCount}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Pending</div>
          </div>
          <div className="px-6 py-3 text-center">
            <div className="font-mono text-2xl font-bold text-neutral-400">{doneCount}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Done</div>
          </div>
        </div>
        <div className="px-4">
          <button onClick={() => setShowForm(v => !v)}
            className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-4 py-2 border border-ink min-h-[44px] transition-colors duration-200 ${
              showForm ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-ink hover:text-paper'
            }`}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Close' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-t-0 border-ink p-6 bg-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Task *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full border-b-2 border-ink bg-transparent px-0 py-2 font-body text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200"
                required autoFocus />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Due Date (optional)</label>
              <input type="datetime-local" value={due} onChange={e => setDue(e.target.value)}
                className="w-full border-b-2 border-ink bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200" />
            </div>
          </div>
          <TagPicker allTags={localTags} selected={selectedTags} onChange={setSelectedTags} />
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={submitting || !title.trim()}
              className="font-mono text-xs uppercase tracking-widest px-6 py-2 bg-ink text-paper border border-ink hover:bg-paper hover:text-ink disabled:opacity-40 transition-colors duration-200 min-h-[44px]">
              {submitting ? 'Adding...' : 'Add Task →'}
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      <div className="border border-t-0 border-ink flex flex-wrap items-center divide-x divide-ink">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`font-mono text-xs uppercase tracking-widest px-4 py-2 min-h-[44px] transition-colors duration-200 ${
              filter === f ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-hover'
            }`}>
            {f}
          </button>
        ))}
        {filterTags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-2 flex-1">
            {filterTags.map(tag => (
              <TagBadge key={tag} tag={tag} active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)} />
            ))}
          </div>
        )}
      </div>

      {/* Todo list */}
      <div className="border border-t-0 border-ink divide-y divide-ink">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="font-serif text-4xl text-neutral-300 mb-2">—</div>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">No tasks found</p>
          </div>
        ) : (
          filtered.map(todo => (
            <TodoItem key={todo.id} todo={todo} allTags={localTags} onRefresh={onRefresh} />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoView;
