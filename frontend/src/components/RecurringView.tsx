import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Plus, X } from 'lucide-react';
import type { RecurringEvent } from '../types';
import { recurringApi } from '../api';
import TagBadge from './TagBadge';
import TagPicker from './TagPicker';
import RecurringItem from './RecurringItem';
import { getNextOccurrenceDays } from '../utils/dateUtils';

interface Props {
  events: RecurringEvent[];
  allTags: string[];
  onRefresh: () => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const RecurringView: FC<Props> = ({ events, allTags, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Form state persists across submits
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<'yearly' | 'monthly' | 'weekly'>('yearly');
  const [date, setDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [remindDays, setRemindDays] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const localTags = useMemo(() => {
    const combined = new Set([...allTags, ...selectedTags]);
    events.forEach(e => e.tags.forEach(tag => combined.add(tag)));
    return Array.from(combined).sort();
  }, [allTags, events, selectedTags]);

  // Filter then sort by next occurrence (soonest first)
  const filtered = useMemo(() => {
    const result = events.filter(e => !activeTag || e.tags.includes(activeTag));
    return result.sort((a, b) => getNextOccurrenceDays(a) - getNextOccurrenceDays(b));
  }, [events, activeTag]);

  const filterTags = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => e.tags.forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    try {
      await recurringApi.create({
        title: title.trim(), recurrence, date,
        tags: selectedTags, notes, remind_days_before: remindDays,
      });
      onRefresh();
      // Keep form state so user can add similar events
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      {/* Header + add button */}
      <div className="flex items-center justify-between border border-ink">
        <div className="px-6 py-3">
          <div className="font-mono text-2xl font-bold text-ink">{events.length}</div>
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Recurring Events</div>
        </div>
        <div className="px-4">
          <button onClick={() => setShowForm(v => !v)}
            className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-4 py-2 border border-ink min-h-[44px] transition-colors duration-200 ${
              showForm ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-ink hover:text-paper'
            }`}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Close' : 'Add Event'}
          </button>
        </div>
      </div>

      {/* Add form — bg-hover ensures dark mode compatibility */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-t-0 border-ink p-6 bg-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Event Name *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Mom's birthday"
                className="w-full border-b-2 border-ink bg-transparent px-0 py-2 font-body text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200"
                required autoFocus />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Recurrence</label>
              <select value={recurrence}
                onChange={e => { setRecurrence(e.target.value as typeof recurrence); setDate(''); }}
                className="w-full border-b-2 border-ink bg-paper px-0 py-2 font-mono text-sm focus:outline-none">
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                {recurrence === 'yearly' ? 'Date (MM-DD)' : recurrence === 'monthly' ? 'Day of Month (1-31)' : 'Day of Week'} *
              </label>
              {recurrence === 'weekly' ? (
                <select value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border-b-2 border-ink bg-paper px-0 py-2 font-mono text-sm focus:outline-none" required>
                  <option value="">Select day...</option>
                  {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input type="text" value={date} onChange={e => setDate(e.target.value)}
                  placeholder={recurrence === 'yearly' ? '08-15' : '15'}
                  className="w-full border-b-2 border-ink bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200"
                  required />
              )}
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Remind (days before)</label>
              <input type="number" value={remindDays} onChange={e => setRemindDays(Number(e.target.value))} min={0} max={30}
                className="w-full border-b-2 border-ink bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200" />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full border-b-2 border-ink bg-transparent px-0 py-2 font-mono text-sm focus:outline-none focus:bg-paper focus:px-2 transition-all duration-200" />
            </div>
          </div>
          <TagPicker allTags={localTags} selected={selectedTags} onChange={setSelectedTags} />
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={submitting || !title.trim() || !date}
              className="font-mono text-xs uppercase tracking-widest px-6 py-2 bg-ink text-paper border border-ink hover:bg-paper hover:text-ink disabled:opacity-40 transition-colors duration-200 min-h-[44px]">
              {submitting ? 'Adding...' : 'Add Event →'}
            </button>
          </div>
        </form>
      )}

      {/* Tag filter */}
      {filterTags.length > 0 && (
        <div className="border border-t-0 border-ink px-4 py-2 flex flex-wrap gap-2">
          {filterTags.map(tag => (
            <TagBadge key={tag} tag={tag} active={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)} />
          ))}
        </div>
      )}

      {/* Events list */}
      <div className="border border-t-0 border-ink divide-y divide-ink">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="font-serif text-4xl text-neutral-300 mb-2">—</div>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">No recurring events</p>
          </div>
        ) : (
          filtered.map(event => (
            <RecurringItem key={event.id} event={event} allTags={localTags} onRefresh={onRefresh} />
          ))
        )}
      </div>
    </div>
  );
};

export default RecurringView;
