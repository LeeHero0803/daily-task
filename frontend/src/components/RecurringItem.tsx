import { useState } from 'react';
import type { FC } from 'react';
import { Trash2, Calendar, RefreshCw, Clock, Pencil, X } from 'lucide-react';
import type { RecurringEvent } from '../types';
import { recurringApi } from '../api';
import TagBadge from './TagBadge';
import TagPicker from './TagPicker';

interface Props {
  event: RecurringEvent;
  allTags: string[];
  onRefresh: () => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getNextOccurrence(event: RecurringEvent): { label: string; daysUntil: number | null } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (event.recurrence === 'yearly') {
    const [month, day] = event.date.split('-').map(Number);
    let next = new Date(today.getFullYear(), month - 1, day);
    if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
    const diff = Math.round((next.getTime() - today.getTime()) / 86400000);
    return { label: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), daysUntil: diff };
  }

  if (event.recurrence === 'monthly') {
    const day = parseInt(event.date);
    let next = new Date(today.getFullYear(), today.getMonth(), day);
    if (next < today) next = new Date(today.getFullYear(), today.getMonth() + 1, day);
    const diff = Math.round((next.getTime() - today.getTime()) / 86400000);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    const ord = s[(v - 20) % 10] || s[v] || s[0];
    return { label: `Every ${day}${ord}`, daysUntil: diff };
  }

  return { label: `Every ${event.date}`, daysUntil: null };
}

const RecurringItem: FC<Props> = ({ event, allTags, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editTitle, setEditTitle] = useState(event.title);
  const [editRecurrence, setEditRecurrence] = useState<'yearly' | 'monthly' | 'weekly'>(event.recurrence);
  const [editDate, setEditDate] = useState(event.date);
  const [editTags, setEditTags] = useState<string[]>(event.tags);
  const [editNotes, setEditNotes] = useState(event.notes);
  const [editRemind, setEditRemind] = useState(event.remind_days_before);

  const openEdit = () => {
    setEditTitle(event.title);
    setEditRecurrence(event.recurrence);
    setEditDate(event.date);
    setEditTags([...event.tags]);
    setEditNotes(event.notes);
    setEditRemind(event.remind_days_before);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDate) return;
    setSaving(true);
    try {
      await recurringApi.update(event.id, {
        title: editTitle.trim(), recurrence: editRecurrence, date: editDate,
        tags: editTags, notes: editNotes, remind_days_before: editRemind,
      });
      setEditing(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    setDeleting(true);
    try {
      await recurringApi.remove(event.id);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  const { label, daysUntil } = getNextOccurrence(event);
  const isSoon = daysUntil !== null && daysUntil <= event.remind_days_before;
  const isToday = daysUntil === 0;
  const RecurrenceIcon = event.recurrence === 'yearly' ? Calendar : RefreshCw;
  const editTagOptions = Array.from(new Set([...allTags, ...editTags])).sort();

  if (editing) {
    return (
      <form onSubmit={handleSave} className="px-6 py-4 bg-hover">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Event Name *</label>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full border-b-2 border-ink bg-transparent px-0 py-1.5 font-body text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200"
              required autoFocus />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Recurrence</label>
            <select value={editRecurrence}
              onChange={e => { setEditRecurrence(e.target.value as typeof editRecurrence); setEditDate(''); }}
              className="w-full border-b-2 border-ink bg-paper px-0 py-1.5 font-mono text-sm focus:outline-none">
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
              {editRecurrence === 'yearly' ? 'Date (MM-DD)' : editRecurrence === 'monthly' ? 'Day of Month' : 'Day of Week'} *
            </label>
            {editRecurrence === 'weekly' ? (
              <select value={editDate} onChange={e => setEditDate(e.target.value)}
                className="w-full border-b-2 border-ink bg-paper px-0 py-1.5 font-mono text-sm focus:outline-none" required>
                <option value="">Select day...</option>
                {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input type="text" value={editDate} onChange={e => setEditDate(e.target.value)}
                placeholder={editRecurrence === 'yearly' ? '08-15' : '15'}
                className="w-full border-b-2 border-ink bg-transparent px-0 py-1.5 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200"
                required />
            )}
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Remind (days before)</label>
            <input type="number" value={editRemind} onChange={e => setEditRemind(Number(e.target.value))} min={0} max={30}
              className="w-full border-b-2 border-ink bg-transparent px-0 py-1.5 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Notes</label>
            <input type="text" value={editNotes} onChange={e => setEditNotes(e.target.value)}
              className="w-full border-b-2 border-ink bg-transparent px-0 py-1.5 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200" />
          </div>
        </div>
        <TagPicker allTags={editTagOptions} selected={editTags} onChange={setEditTags} />
        <div className="flex gap-2 justify-end mt-3">
          <button type="button" onClick={() => setEditing(false)}
            className="font-mono text-xs uppercase tracking-widest px-4 py-1.5 border border-ink hover:bg-ink hover:text-paper transition-colors duration-200 flex items-center gap-1">
            <X size={12} /> Cancel
          </button>
          <button type="submit" disabled={saving || !editTitle.trim() || !editDate}
            className="font-mono text-xs uppercase tracking-widest px-4 py-1.5 bg-ink text-paper border border-ink hover:bg-paper hover:text-ink disabled:opacity-40 transition-colors duration-200">
            {saving ? 'Saving...' : 'Save →'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="group relative flex items-start gap-4 px-6 py-4 transition-colors duration-200 hover:bg-hover">
      <div className={`flex-shrink-0 w-10 h-10 border flex items-center justify-center transition-colors duration-200 ${
        isToday ? 'bg-accent border-accent text-paper' : isSoon ? 'bg-ink border-ink text-paper' : 'border-ink text-ink'
      }`}>
        <RecurrenceIcon size={16} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="font-body text-base text-ink">{event.title}</p>
          {isToday && <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">Today!</span>}
          {isSoon && !isToday && <span className="font-mono text-xs uppercase tracking-widest text-accent">In {daysUntil}d</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className={`font-mono text-xs uppercase tracking-widest flex items-center gap-1 ${isSoon ? 'text-accent' : 'text-neutral-500'}`}>
            <Clock size={10} />{label}
          </span>
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">{event.recurrence}</span>
          {event.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>
        {event.notes && <p className="font-body text-sm text-neutral-500 italic mt-1">{event.notes}</p>}
      </div>

      {daysUntil !== null && (
        <div className={`flex-shrink-0 text-center px-3 py-1 border ${
          isToday ? 'bg-accent border-accent text-paper' :
          isSoon ? 'border-ink bg-ink text-paper' : 'border-muted text-neutral-400'
        }`}>
          <div className="font-mono text-lg font-bold leading-none">{isToday ? '!' : daysUntil}</div>
          <div className="font-mono text-xs uppercase tracking-widest leading-none mt-0.5">{isToday ? 'today' : 'days'}</div>
        </div>
      )}

      {/* Overlay buttons — absolute so they don't shift layout */}
      <div className="absolute right-6 inset-y-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-hover pl-4">
        <button onClick={openEdit} aria-label="Edit event"
          className="w-8 h-8 border border-transparent hover:border-ink text-ink flex items-center justify-center">
          <Pencil size={13} strokeWidth={1.5} />
        </button>
        <button onClick={handleDelete} disabled={deleting} aria-label="Delete event"
          className="w-8 h-8 border border-transparent hover:border-accent hover:text-accent flex items-center justify-center">
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default RecurringItem;
