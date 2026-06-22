import { useState } from 'react';
import { Check, X, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface User { id: string; name: string; email: string; department: string; }

interface AssigneePickerProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// Simple fuzzy match
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  // Check if all query chars appear in order in the text
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function AssigneePicker({ users, selectedIds, onChange }: AssigneePickerProps) {
  const [search, setSearch] = useState('');

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  const filtered = users.filter(u =>
    fuzzyMatch(u.name, search) || fuzzyMatch(u.email, search) || fuzzyMatch(u.department, search)
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-ring outline-none"
        />
      </div>
      <div className="border rounded-lg max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">No users found</p>
        ) : (
          filtered.map(u => (
            <button
              key={u.id}
              onClick={() => toggle(u.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors border-b last:border-b-0',
                selectedIds.includes(u.id) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              <div className="text-left">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.department} · {u.email}</p>
              </div>
              {selectedIds.includes(u.id) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 opacity-30" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
