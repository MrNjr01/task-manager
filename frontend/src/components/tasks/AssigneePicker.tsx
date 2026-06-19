import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface User { id: string; name: string; email: string; department: string; }

interface AssigneePickerProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function AssigneePicker({ users, selectedIds, onChange }: AssigneePickerProps) {
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  return (
    <div className="border rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
      {users.map(u => (
        <button
          key={u.id}
          onClick={() => toggle(u.id)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
            selectedIds.includes(u.id) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
          )}
        >
          <div className="text-left">
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.department}</p>
          </div>
          {selectedIds.includes(u.id) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 opacity-30" />}
        </button>
      ))}
    </div>
  );
}
