import type { FC } from 'react';
import { Sun, Moon } from 'lucide-react';

type Tab = 'todos' | 'recurring' | 'calendar';

interface Props {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Tasks' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'calendar', label: 'Calendar' },
];

const Header: FC<Props> = ({ tab, onTabChange, darkMode, onToggleDark }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="border-b-4 border-ink bg-paper sticky top-0 z-40">
      {/* Metadata bar */}
      <div className="border-b border-ink px-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center py-1">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Vol. I</span>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">{today}</span>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Local Edition</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="px-4 max-w-screen-xl mx-auto py-4 text-center border-b border-ink">
        <h1 className="font-serif font-black text-5xl md:text-7xl text-ink tracking-tighter leading-none">
          THE DAILY TASK
        </h1>
        <p className="font-body italic text-sm text-neutral-500 mt-1">
          "All the Tasks That's Fit to Print."
        </p>
      </div>

      {/* Tab navigation + dark mode toggle */}
      <div className="max-w-screen-xl mx-auto px-4 flex items-stretch justify-between">
        <div className="flex">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`font-mono text-xs uppercase tracking-widest px-6 py-3 border-r border-ink transition-colors duration-200 min-h-[44px] ${
                tab === id
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-ink hover:bg-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="px-4 border-l border-ink hover:bg-hover transition-colors duration-200 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink min-h-[44px]"
        >
          {darkMode ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
