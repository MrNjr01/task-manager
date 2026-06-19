import { List, Columns, TreePine } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ViewMode = 'list' | 'kanban' | 'tree';

interface ViewSwitcherProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewSwitcher({ mode, onChange }: ViewSwitcherProps) {
  const modes: { value: ViewMode; icon: typeof List; label: string }[] = [
    { value: 'list', icon: List, label: 'List' },
    { value: 'kanban', icon: Columns, label: 'Kanban' },
    { value: 'tree', icon: TreePine, label: 'Tree' },
  ];

  return (
    <div className="flex items-center border rounded-lg p-1">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
            mode === value ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
