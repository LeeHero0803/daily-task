import type { FC } from 'react';

interface Props {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

const TagBadge: FC<Props> = ({ tag, active, onClick }) => {
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`inline-block font-mono text-xs uppercase tracking-wider px-2 py-0.5 border transition-colors duration-200 ${
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-paper text-ink border-ink hover:bg-ink hover:text-paper'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {tag}
    </span>
  );
};

export default TagBadge;
