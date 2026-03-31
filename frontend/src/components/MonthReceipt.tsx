/**
 * MonthReceipt — thermal-printer / shopping-receipt style long image.
 * Pure inline styles so html-to-image captures every rule correctly.
 *
 * Layout principles:
 *  • Full-width items: title flex-1, secondary info right-aligned
 *  • Stat rows: label + dotted flex-fill + right-aligned number
 *  • Day headers: date left / item-count right
 */
import type { FC, Ref } from 'react';
import type { Todo, RecurringEvent } from '../types';
import { recurringOccursOnDay } from '../utils/dateUtils';

interface Props {
  ref: Ref<HTMLDivElement>;
  year: number;
  month: number;
  todos: Todo[];
  events: RecurringEvent[];
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONO   = '"JetBrains Mono","Courier New",monospace';
const SERIF  = '"Playfair Display","Times New Roman",serif';
const INK    = '#111111';
const PAPER  = '#F9F9F7';
const MUTED  = '#737373';
const FAINT  = '#A3A3A3';
const SUBTLE = '#E5E5E0';
const RED    = '#CC0000';

// ─── sub-components ────────────────────────────────────────────────────────

/** A stat row: LABEL ········· VALUE (dot-fill via flex + border-bottom) */
const StatRow: FC<{ label: string; value: number; indent?: boolean; accent?: boolean }> =
  ({ label, value, indent, accent }) => (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: '4px',
      marginBottom: '4px',
      paddingLeft: indent ? '16px' : '0',
    }}>
      <span style={{
        fontFamily: MONO, fontSize: '11px', whiteSpace: 'nowrap',
        color: accent ? RED : INK, letterSpacing: '0.04em',
      }}>
        {label}
      </span>
      {/* dot fill */}
      <span style={{
        flex: 1, borderBottom: `1px dotted ${FAINT}`,
        marginBottom: '3px', minWidth: '20px',
      }} />
      <span style={{
        fontFamily: MONO, fontSize: '12px', fontWeight: 'bold',
        whiteSpace: 'nowrap', color: accent ? RED : INK,
      }}>
        {value}
      </span>
    </div>
  );

/** Horizontal rule variants */
const Heavy = () => <div style={{ borderTop: `2px solid ${INK}`, margin: '14px 0' }} />;
const Thin  = () => <div style={{ borderTop: `1px solid ${INK}`, margin: '10px 0' }} />;
const Dash  = () => (
  <div style={{
    borderTop: `1px dashed ${FAINT}`, margin: '10px 0',
  }} />
);

/** Tag chip */
const Tag: FC<{ label: string }> = ({ label }) => (
  <span style={{
    display: 'inline-block',
    border: `1px solid ${FAINT}`,
    padding: '0 4px', marginRight: '4px', marginTop: '2px',
    fontFamily: MONO, fontSize: '9px', letterSpacing: '0.1em',
    color: MUTED,
  }}>
    {label.toUpperCase()}
  </span>
);

// ─── main component ─────────────────────────────────────────────────────────

const MonthReceipt: FC<Props> = ({ ref, year, month, todos, events }) => {
  const today   = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build per-day data (only days that have something)
  type DayEntry = { date: Date; todos: Todo[]; events: RecurringEvent[] };
  const dayEntries: DayEntry[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dt = todos.filter(t => {
      if (!t.due) return false;
      const dd = new Date(t.due);
      return dd.getFullYear() === year && dd.getMonth() === month && dd.getDate() === d;
    });
    const ev = events.filter(e => recurringOccursOnDay(e, date));
    if (dt.length || ev.length) dayEntries.push({ date, todos: dt, events: ev });
  }

  const noDatePending = todos.filter(t => !t.due && !t.done);

  // Stats
  const monthTodos  = todos.filter(t => {
    if (!t.due) return false;
    const d = new Date(t.due);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const pendingCnt  = monthTodos.filter(t => !t.done).length;
  const doneCnt     = monthTodos.filter(t => t.done).length;
  const recurringCnt = dayEntries.reduce((n, e) => n + e.events.length, 0);

  const printedAt = today.toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }) + '  ' + today.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div ref={ref} style={{
      width: '400px',
      backgroundColor: PAPER,
      color: INK,
      fontFamily: MONO,
      fontSize: '12px',
      lineHeight: '1.6',
      padding: '28px 22px 32px',
      boxSizing: 'border-box',
    }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        {/* Top rule */}
        <div style={{ borderTop: `3px double ${INK}`, marginBottom: '14px' }} />

        <div style={{
          fontFamily: SERIF, fontSize: '26px', fontWeight: 900,
          letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: '6px',
        }}>
          THE DAILY TASK
        </div>

        {/* Month + year in a band */}
        <div style={{
          display: 'inline-block',
          border: `1px solid ${INK}`,
          padding: '2px 16px', marginBottom: '8px',
          fontFamily: MONO, fontSize: '13px', fontWeight: 'bold',
          letterSpacing: '0.18em',
        }}>
          {MONTHS[month].toUpperCase()} {year}
        </div>

        <div style={{
          fontFamily: MONO, fontSize: '9.5px',
          letterSpacing: '0.16em', color: MUTED,
          marginBottom: '2px',
        }}>
          MONTHLY SUMMARY
        </div>
        <div style={{
          fontFamily: MONO, fontSize: '9px',
          color: FAINT, letterSpacing: '0.1em',
        }}>
          PRINTED {printedAt}
        </div>

        {/* Bottom rule */}
        <div style={{ borderTop: `3px double ${INK}`, marginTop: '14px' }} />
      </div>

      {/* ── DAY ENTRIES ───────────────────────────────── */}
      {dayEntries.length === 0 ? (
        <div style={{
          textAlign: 'center', color: MUTED,
          padding: '24px 0', fontSize: '11px', letterSpacing: '0.1em',
        }}>
          NO EVENTS SCHEDULED THIS MONTH
        </div>
      ) : (
        dayEntries.map(({ date, todos: dt, events: ev }, idx) => {
          const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
          const itemCount = dt.length + ev.length;

          return (
            <div key={idx} style={{ marginBottom: '2px' }}>

              {/* Day header: date ←→ item count */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: `1px solid ${INK}`,
                paddingBottom: '3px', marginBottom: '8px', marginTop: idx === 0 ? '10px' : '0',
              }}>
                <span style={{
                  fontFamily: MONO, fontSize: '11px', fontWeight: 'bold',
                  letterSpacing: '0.14em',
                }}>
                  {weekday} · {dateStr}
                </span>
                <span style={{
                  fontFamily: MONO, fontSize: '9.5px',
                  color: MUTED, letterSpacing: '0.08em',
                }}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* ── Tasks ── */}
              {dt.map((t, ti) => {
                const isOverdue = !t.done && t.due && new Date(t.due) < new Date();
                const timeStr = t.due
                  ? new Date(t.due).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  : null;
                return (
                  <div key={ti} style={{
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                    marginBottom: '8px', paddingLeft: '2px',
                  }}>
                    {/* Checkbox */}
                    <span style={{
                      flexShrink: 0, width: '16px',
                      fontSize: '14px', lineHeight: '1.4',
                      color: t.done ? FAINT : INK,
                    }}>
                      {t.done ? '☑' : '□'}
                    </span>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title row: title ←→ time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{
                          flex: 1,
                          textDecoration: t.done ? 'line-through' : 'none',
                          color: t.done ? FAINT : (isOverdue ? RED : INK),
                          wordBreak: 'break-word',
                          fontSize: '12px',
                        }}>
                          {t.title}
                        </span>
                        {timeStr && (
                          <span style={{
                            flexShrink: 0, fontSize: '10px',
                            color: isOverdue && !t.done ? RED : MUTED,
                            letterSpacing: '0.04em', marginTop: '1px',
                          }}>
                            {timeStr}
                          </span>
                        )}
                      </div>
                      {/* Tags */}
                      {t.tags.length > 0 && (
                        <div style={{ marginTop: '3px' }}>
                          {t.tags.map(tag => <Tag key={tag} label={tag} />)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ── Recurring Events ── */}
              {ev.map((e, ei) => (
                <div key={ei} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  marginBottom: '8px', paddingLeft: '2px',
                }}>
                  {/* Icon */}
                  <span style={{
                    flexShrink: 0, width: '16px',
                    fontSize: '14px', lineHeight: '1.4', color: INK,
                  }}>
                    ◎
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title row: title ←→ recurrence type */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ flex: 1, wordBreak: 'break-word', fontSize: '12px' }}>
                        {e.title}
                      </span>
                      <span style={{
                        flexShrink: 0, fontSize: '10px', color: MUTED,
                        letterSpacing: '0.08em', marginTop: '1px',
                      }}>
                        {e.recurrence.toUpperCase()}
                      </span>
                    </div>
                    {/* Notes + tags */}
                    {(e.notes || e.tags.length > 0) && (
                      <div style={{ marginTop: '3px' }}>
                        {e.notes && (
                          <span style={{ fontSize: '10px', color: MUTED, marginRight: '6px' }}>
                            {e.notes}
                          </span>
                        )}
                        {e.tags.map(tag => <Tag key={tag} label={tag} />)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Separator between days */}
              {idx < dayEntries.length - 1 && <Dash />}
            </div>
          );
        })
      )}

      {/* ── PENDING / NO DUE DATE ─────────────────────── */}
      {noDatePending.length > 0 && (
        <>
          <Heavy />
          <div style={{
            fontFamily: MONO, fontSize: '10px', letterSpacing: '0.16em',
            color: MUTED, textAlign: 'center', marginBottom: '10px',
          }}>
            PENDING — NO DUE DATE
          </div>
          {noDatePending.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              marginBottom: '6px', paddingLeft: '2px',
            }}>
              <span style={{ flexShrink: 0, width: '16px', fontSize: '14px', lineHeight: '1.4' }}>□</span>
              <span style={{ flex: 1, fontSize: '12px', wordBreak: 'break-word' }}>{t.title}</span>
            </div>
          ))}
        </>
      )}

      {/* ── SUMMARY ───────────────────────────────────── */}
      <Heavy />

      <div style={{
        fontFamily: MONO, fontSize: '10px', letterSpacing: '0.2em',
        color: MUTED, textAlign: 'center', marginBottom: '10px',
      }}>
        MONTHLY SUMMARY
      </div>

      <Thin />

      <StatRow label="TASKS THIS MONTH"  value={monthTodos.length} />
      <StatRow label="PENDING"           value={pendingCnt}        indent accent={pendingCnt > 0} />
      <StatRow label="COMPLETED"         value={doneCnt}           indent />
      <div style={{ marginTop: '6px' }} />
      <StatRow label="RECURRING EVENTS"  value={recurringCnt} />

      <Thin />

      {/* ── FOOTER ────────────────────────────────────── */}
      <div style={{
        textAlign: 'center', marginTop: '10px',
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: '13px', fontWeight: 700,
          letterSpacing: '0.04em', marginBottom: '3px',
        }}>
          The Daily Task
        </div>
        <div style={{
          fontFamily: MONO, fontSize: '9px', color: MUTED,
          letterSpacing: '0.12em', marginBottom: '16px',
        }}>
          ALL DATA STORED ON YOUR DEVICE
        </div>

        {/* Perforated cut line */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: FAINT, fontSize: '11px',
        }}>
          <span>✂</span>
          <div style={{ flex: 1, borderTop: `1px dashed ${FAINT}` }} />
          <span>✂</span>
        </div>
      </div>

    </div>
  );
};

export default MonthReceipt;
