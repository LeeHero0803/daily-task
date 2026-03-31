export function formatDueRelative(due: string): { label: string; isOverdue: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(due);
  dueDate.setHours(0, 0, 0, 0);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const abs = Math.abs(diffDays);

  let label: string;
  if (diffDays === 0) {
    label = 'Today';
  } else if (diffDays === 1) {
    label = 'Tomorrow';
  } else if (diffDays === -1) {
    label = '1d ago';
  } else if (abs <= 7) {
    label = isOverdue ? `${abs}d ago` : `${abs}d`;
  } else {
    const weeks = Math.floor(abs / 7);
    label = isOverdue ? `${weeks}w ago` : `${weeks}w`;
  }

  return { label, isOverdue };
}

export function formatDueFull(due: string): string {
  const d = new Date(due);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

export function getNextOccurrenceDays(event: { recurrence: string; date: string }): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (event.recurrence === 'yearly') {
    const [month, day] = event.date.split('-').map(Number);
    let next = new Date(today.getFullYear(), month - 1, day);
    if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
    return Math.round((next.getTime() - today.getTime()) / 86400000);
  }
  if (event.recurrence === 'monthly') {
    const day = parseInt(event.date);
    let next = new Date(today.getFullYear(), today.getMonth(), day);
    if (next < today) next = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return Math.round((next.getTime() - today.getTime()) / 86400000);
  }
  if (event.recurrence === 'weekly') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = dayNames.indexOf(event.date);
    const todayDay = today.getDay();
    let diff = targetDay - todayDay;
    if (diff < 0) diff += 7;
    return diff;
  }
  return 999;
}

export function recurringOccursOnDay(event: { recurrence: string; date: string }, date: Date): boolean {
  if (event.recurrence === 'yearly') {
    const [month, day] = event.date.split('-').map(Number);
    return date.getMonth() + 1 === month && date.getDate() === day;
  }
  if (event.recurrence === 'monthly') {
    return date.getDate() === parseInt(event.date);
  }
  if (event.recurrence === 'weekly') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()] === event.date;
  }
  return false;
}
