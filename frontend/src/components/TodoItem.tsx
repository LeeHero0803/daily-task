import { useState } from 'react';
import type { FC } from 'react';
import { Trash2, Check, Pencil, X } from 'lucide-react';
import type { Todo } from '../types';
import { todosApi } from '../api';
import TagBadge from './TagBadge';
import TagPicker from './TagPicker';
import { formatDueRelative, formatDueFull } from '../utils/dateUtils';

interface Props {
  todo: Todo;
  allTags: string[];
  onRefresh: () => void;
}

const TodoItem: FC<Props> = ({ todo, allTags, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDue, setEditDue] = useState(todo.due ? todo.due.slice(0, 16) : '');
  const [editTags, setEditTags] = useState<string[]>(todo.tags);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await todosApi.update(todo.id, { done: !todo.done });
      onRefresh();
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${todo.title}"?`)) return;
    setDeleting(true);
    try {
      await todosApi.remove(todo.id);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = () => {
    setEditTitle(todo.title);
    setEditDue(todo.due ? todo.due.slice(0, 16) : '');
    setEditTags([...todo.tags]);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await todosApi.update(todo.id, { title: editTitle.trim(), due: editDue || null, tags: editTags });
      setEditing(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const dueInfo = todo.due ? formatDueRelative(todo.due) : null;
  const editTagOptions = Array.from(new Set([...allTags, ...editTags])).sort();

  if (editing) {
    return (
      <form onSubmit={handleSave} className="px-6 py-4 bg-hover">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Task</label>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full border-b-2 border-ink bg-transparent px-0 py-1.5 font-body text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200"
              required autoFocus />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Due Date</label>
            <input type="datetime-local" value={editDue} onChange={e => setEditDue(e.target.value)}
              className="w-full border-b-2 border-ink bg-transparent px-0 py-1.5 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200" />
          </div>
        </div>
        <TagPicker allTags={editTagOptions} selected={editTags} onChange={setEditTags} />
        <div className="flex gap-2 justify-end mt-3">
          <button type="button" onClick={() => setEditing(false)}
            className="font-mono text-xs uppercase tracking-widest px-4 py-1.5 border border-ink hover:bg-ink hover:text-paper transition-colors duration-200 flex items-center gap-1">
            <X size={12} /> Cancel
          </button>
          <button type="submit" disabled={saving || !editTitle.trim()}
            className="font-mono text-xs uppercase tracking-widest px-4 py-1.5 bg-ink text-paper border border-ink hover:bg-paper hover:text-ink disabled:opacity-40 transition-colors duration-200">
            {saving ? 'Saving...' : 'Save →'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`group relative flex items-center gap-3 px-6 py-4 transition-colors duration-200 hover:bg-hover ${todo.done ? 'opacity-60' : ''}`}>
      <button onClick={handleToggle} disabled={toggling} aria-label={todo.done ? 'Mark as pending' : 'Mark as done'}
        className={`flex-shrink-0 w-5 h-5 border border-ink flex items-center justify-center transition-colors duration-200 min-w-[20px] ${todo.done ? 'bg-ink' : 'bg-paper hover:bg-muted'}`}>
        {todo.done && <Check size={12} className="text-paper" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-body text-base leading-snug ${todo.done ? 'line-through text-neutral-400' : 'text-ink'}`}>
          {todo.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {dueInfo && (
            <span className={`font-mono text-xs uppercase tracking-widest ${dueInfo.isOverdue && !todo.done ? 'text-accent font-bold' : 'text-neutral-500'}`}>
              DUE: {dueInfo.label}
            </span>
          )}
          {todo.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>
      </div>

      {todo.due && (
        <span className="flex-shrink-0 font-mono text-xs text-neutral-400 hidden md:block whitespace-nowrap">
          {formatDueFull(todo.due)}
        </span>
      )}

      {/* Overlay buttons — absolute so they don't shift layout */}
      <div className="absolute right-6 inset-y-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-hover pl-4">
        <button onClick={openEdit} aria-label="Edit task"
          className="w-8 h-8 border border-transparent hover:border-ink text-ink flex items-center justify-center">
          <Pencil size={13} strokeWidth={1.5} />
        </button>
        <button onClick={handleDelete} disabled={deleting} aria-label="Delete task"
          className="w-8 h-8 border border-transparent hover:border-accent hover:text-accent flex items-center justify-center">
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
