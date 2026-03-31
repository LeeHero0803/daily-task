import type { FC } from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  allTags: string[];          // all known tags
  selected: string[];         // currently selected tags
  onChange: (tags: string[]) => void;
}

const TagPicker: FC<Props> = ({ allTags, selected, onChange }) => {
  const [input, setInput] = useState('');

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  const addNew = () => {
    const tag = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag) return;
    if (!selected.includes(tag)) {
      onChange([...selected, tag]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNew();
    }
  };

  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        {allTags.map(tag => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`font-mono text-xs uppercase tracking-wider px-2 py-1 border border-ink transition-colors duration-150 min-h-[32px] ${
                isSelected
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-ink hover:bg-ink hover:text-paper'
              }`}
            >
              {isSelected ? '✓ ' : ''}{tag}
            </button>
          );
        })}
        <div className="flex items-center border border-ink">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="new tag"
            className="bg-transparent font-mono text-xs px-2 py-1 w-24 focus:outline-none focus:w-32 transition-all duration-200 placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={addNew}
            className="px-2 py-1 border-l border-ink hover:bg-ink hover:text-paper transition-colors duration-150"
            aria-label="Add tag"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagPicker;
