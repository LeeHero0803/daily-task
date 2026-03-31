import { useState, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, Scroll, Download, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Todo, RecurringEvent } from '../types';
import { recurringOccursOnDay } from '../utils/dateUtils';
import MonthReceipt from './MonthReceipt';

interface Props {
  todos: Todo[];
  events: RecurringEvent[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) days.push(new Date(year, month, -i));
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  const rem = 7 - (days.length % 7);
  if (rem < 7) for (let i = 1; i <= rem; i++) days.push(new Date(year, month + 1, i));
  return days;
}

// ── Mini month card used in year view ──────────────────────────────────────
const MiniMonth: FC<{
  year: number; month: number;
  todos: Todo[]; events: RecurringEvent[];
  isCurrentMonth: boolean;
  onClick: () => void;
}> = ({ year, month, todos, events, isCurrentMonth, onClick }) => {
  const today = new Date();
  const days = getDaysInMonth(year, month);

  const hasTodoOnDay = (d: Date) =>
    todos.some(t => {
      if (!t.due) return false;
      const dd = new Date(t.due);
      return dd.getFullYear() === d.getFullYear() && dd.getMonth() === d.getMonth() && dd.getDate() === d.getDate();
    });

  const hasEventOnDay = (d: Date) => events.some(e => recurringOccursOnDay(e, d));

  const monthTodoCount = days.filter(d => d.getMonth() === month && hasTodoOnDay(d)).length;
  const monthEventCount = days.filter(d => d.getMonth() === month && hasEventOnDay(d)).length;

  return (
    <div onClick={onClick}
      className={`border-r border-b border-ink p-3 cursor-pointer transition-colors duration-150 hover:bg-hover ${isCurrentMonth ? 'bg-muted' : 'bg-paper'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-serif font-bold text-sm ${isCurrentMonth ? 'text-accent' : 'text-ink'}`}>
          {MONTHS_SHORT[month]}
        </span>
        <div className="flex gap-2">
          {monthTodoCount > 0 && (
            <span className="font-mono text-xs bg-ink text-paper px-1">{monthTodoCount}</span>
          )}
          {monthEventCount > 0 && (
            <span className="font-mono text-xs border border-ink text-ink px-1">{monthEventCount}</span>
          )}
        </div>
      </div>
      {/* Tiny 7-col day grid */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const isToday = d.toDateString() === today.toDateString();
          const hasTodo = inMonth && hasTodoOnDay(d);
          const hasEvent = inMonth && hasEventOnDay(d);
          return (
            <div key={i}
              className={`w-full aspect-square flex items-center justify-center text-[8px] font-mono leading-none
                ${!inMonth ? 'opacity-20' : ''}
                ${isToday ? 'bg-ink text-paper' : hasTodo ? 'bg-accent text-paper' : hasEvent ? 'bg-muted' : ''}`}>
              {inMonth ? d.getDate() : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main CalendarView ───────────────────────────────────────────────────────
const CalendarView: FC<Props> = ({ todos, events }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [subView, setSubView] = useState<'month' | 'year'>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setCapturing(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 2,
        backgroundColor: '#F9F9F7',
      });
      const link = document.createElement('a');
      link.download = `daily-task-${MONTHS[month]}-${year}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setCapturing(false);
    }
  };

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getTodosForDay = (date: Date) =>
    todos.filter(t => {
      if (!t.due) return false;
      const d = new Date(t.due);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
    });

  const getEventsForDay = (date: Date) => events.filter(e => recurringOccursOnDay(e, date));

  const selectedTodos = selectedDay ? getTodosForDay(selectedDay) : [];
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // ── Year view ─────────────────────────────────────────────────────────────
  if (subView === 'year') {
    return (
      <div className="py-8">
        {/* Year header */}
        <div className="border border-ink flex items-center justify-between px-6 py-4 mb-0">
          <button onClick={() => setYear(y => y - 1)}
            className="w-10 h-10 border border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors duration-200">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-4">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-ink tracking-tight">{year}</h2>
            <button onClick={() => setSubView('month')}
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-ink hover:bg-ink hover:text-paper transition-colors duration-200">
              <CalendarDays size={12} /> Month
            </button>
          </div>
          <button onClick={() => setYear(y => y + 1)}
            className="w-10 h-10 border border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors duration-200">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Legend */}
        <div className="border border-t-0 border-ink px-4 py-2 flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-accent" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Task due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-muted border border-ink" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Recurring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs bg-ink text-paper px-1">N</span>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Tasks count</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs border border-ink px-1">N</span>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Events count</span>
          </div>
        </div>

        {/* 4×3 month grid */}
        <div className="border border-t-0 border-l border-ink grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, m) => (
            <MiniMonth key={m} year={year} month={m}
              todos={todos} events={events}
              isCurrentMonth={m === today.getMonth() && year === today.getFullYear()}
              onClick={() => { setMonth(m); setSubView('month'); }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Month view ────────────────────────────────────────────────────────────
  return (
    <div className="py-8">
      {/* Month header */}
      <div className="border border-ink flex items-center justify-between px-6 py-4">
        <button onClick={prevMonth}
          className="w-10 h-10 border border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors duration-200"
          aria-label="Previous month">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-ink tracking-tight">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setSubView('year')}
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-ink hover:bg-ink hover:text-paper transition-colors duration-200">
              <LayoutGrid size={12} /> Year
            </button>
            <button onClick={() => setShowReceipt(true)}
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-ink hover:bg-ink hover:text-paper transition-colors duration-200">
              <Scroll size={12} /> Receipt
            </button>
          </div>
        </div>
        <button onClick={nextMonth}
          className="w-10 h-10 border border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors duration-200"
          aria-label="Next month">
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="border border-t-0 border-ink grid grid-cols-7">
        {WEEKDAYS.map(day => (
          <div key={day} className="border-r last:border-r-0 border-ink py-2 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="border border-t-0 border-ink grid grid-cols-7">
        {days.map((date, i) => {
          const inMonth = date.getMonth() === month;
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDay?.toDateString() === date.toDateString();
          const dayTodos = getTodosForDay(date);
          const dayEvents = getEventsForDay(date);
          const total = dayTodos.length + dayEvents.length;

          return (
            <div key={i} onClick={() => setSelectedDay(isSelected ? null : date)}
              className={`border-b border-ink min-h-[80px] md:min-h-[100px] p-2 cursor-pointer transition-colors duration-150 flex flex-col ${
                (i + 1) % 7 !== 0 ? 'border-r' : ''
              } ${
                isSelected ? 'bg-ink' :
                isToday ? 'bg-muted' :
                inMonth ? 'bg-paper hover:bg-hover' : 'bg-hover opacity-40'
              }`}>
              <span className={`font-mono text-xs font-bold self-start leading-none mb-1 ${
                isSelected ? 'text-paper' :
                isToday ? 'text-accent font-black' :
                inMonth ? 'text-ink' : 'text-neutral-400'
              }`}>
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5 flex-1">
                {dayTodos.slice(0, 2).map(t => (
                  <div key={t.id} className={`font-mono text-xs px-1 truncate leading-tight py-0.5 ${
                    isSelected ? 'bg-paper text-ink' : t.done ? 'line-through text-neutral-400' : 'bg-ink text-paper'
                  }`}>{t.title}</div>
                ))}
                {dayEvents.slice(0, 2 - Math.min(dayTodos.length, 2)).map(e => (
                  <div key={e.id} className={`font-mono text-xs px-1 truncate leading-tight py-0.5 border ${
                    isSelected ? 'border-paper text-paper' : 'border-ink text-ink'
                  }`}>{e.title}</div>
                ))}
                {total > 4 && (
                  <span className={`font-mono text-xs ${isSelected ? 'text-paper' : 'text-neutral-500'}`}>
                    +{total - 4} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day detail panel */}
      {selectedDay && (selectedTodos.length > 0 || selectedEvents.length > 0) && (
        <div className="border border-t-0 border-ink p-6">
          <h3 className="font-serif font-bold text-xl mb-4 text-ink">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedTodos.length > 0 && (
            <div className="mb-4">
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">Tasks</p>
              <div className="divide-y divide-ink border border-ink">
                {selectedTodos.map(t => (
                  <div key={t.id} className={`px-4 py-2 flex items-center gap-3 ${t.done ? 'opacity-60' : ''}`}>
                    <div className={`w-3 h-3 border border-ink flex-shrink-0 ${t.done ? 'bg-ink' : ''}`} />
                    <span className={`font-body text-sm flex-1 ${t.done ? 'line-through text-neutral-400' : 'text-ink'}`}>{t.title}</span>
                    {t.tags.map(tag => <span key={tag} className="font-mono text-xs border border-ink px-1 uppercase tracking-wider">{tag}</span>)}
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedEvents.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">Recurring</p>
              <div className="divide-y divide-ink border border-ink">
                {selectedEvents.map(e => (
                  <div key={e.id} className="px-4 py-2 flex items-center gap-3">
                    <div className="w-3 h-3 border border-ink flex-shrink-0" />
                    <span className="font-body text-sm text-ink flex-1">{e.title}</span>
                    <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">{e.recurrence}</span>
                    {e.tags.map(tag => <span key={tag} className="font-mono text-xs border border-ink px-1 uppercase tracking-wider">{tag}</span>)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedDay && selectedTodos.length === 0 && selectedEvents.length === 0 && (
        <div className="border border-t-0 border-ink py-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            No events on {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {showReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4"
          onClick={e => { if (e.target === e.currentTarget) setShowReceipt(false); }}
        >
          <div className="flex flex-col items-center gap-4 w-full max-w-[440px]">
            {/* Toolbar */}
            <div className="flex gap-2 self-stretch justify-between items-center bg-paper border border-ink px-4 py-3">
              <span className="font-mono text-xs uppercase tracking-widest text-ink">
                {MONTHS[month]} {year} — Receipt
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={capturing}
                  className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest px-3 py-1.5 bg-ink text-paper border border-ink hover:bg-paper hover:text-ink disabled:opacity-50 transition-colors duration-200"
                >
                  <Download size={12} />
                  {capturing ? 'Saving...' : 'Save PNG'}
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="w-8 h-8 border border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors duration-200"
                  aria-label="Close"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Receipt preview */}
            <div className="border border-ink shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
              <MonthReceipt
                ref={receiptRef}
                year={year}
                month={month}
                todos={todos}
                events={events}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
