import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface DelegatedPerson {
  user: { id: string; name: string; email: string; profilePhoto: string | null };
  totalAssigned: number;
  completed: number;
  pending: number;
  overdue: number;
}

export function DelegatedKpis() {
  const [persons, setPersons] = useState<DelegatedPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ persons: DelegatedPerson[] }>('/api/dashboard/delegated').then(res => {
      setPersons(res.data.persons);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="border rounded-lg p-4 animate-pulse">Loading delegated tasks...</div>;
  if (persons.length === 0) return <div className="border rounded-lg p-8 text-center text-muted-foreground">No delegated tasks</div>;

  return (
    <div className="border rounded-lg divide-y">
      {persons.map(p => (
        <div key={p.user.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {p.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{p.user.name}</p>
              <p className="text-sm text-muted-foreground">{p.user.email}</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">{p.totalAssigned} assigned</span>
            <span className="text-green-600">{p.completed} done</span>
            <span className="text-amber-600">{p.pending} pending</span>
            {p.overdue > 0 && <span className="text-red-600">{p.overdue} overdue</span>}
          </div>
          <div className="w-32">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${p.totalAssigned > 0 ? (p.completed / p.totalAssigned) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
