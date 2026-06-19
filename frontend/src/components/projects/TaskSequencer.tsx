import { useState } from 'react';
import { GripVertical, ArrowRight } from 'lucide-react';

interface Task { id: string; title: string; depType: 'none' | 'sequential' | 'parallel'; orderIndex: number; }

interface TaskSequencerProps {
  tasks: Task[];
  onReorder: (updates: { id: string; orderIndex: number; depType: string }[]) => void;
}

export function TaskSequencer({ tasks, onReorder }: TaskSequencerProps) {
  const [items, setItems] = useState([...tasks].sort((a, b) => a.orderIndex - b.orderIndex));

  const toggleDepType = (id: string) => {
    setItems(prev => prev.map(t =>
      t.id === id ? { ...t, depType: t.depType === 'sequential' ? 'parallel' : 'sequential' } : t
    ));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
  };

  const saveOrder = () => {
    const updates = items.map((t, i) => ({ id: t.id, orderIndex: i, depType: t.depType }));
    onReorder(updates);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Task Order</h3>
        <button onClick={saveOrder} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">Save Order</button>
      </div>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={t.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-sm">{t.title}</p>
              <button onClick={() => toggleDepType(t.id)} className={`text-xs mt-0.5 px-2 py-0.5 rounded-full ${t.depType === 'sequential' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {t.depType === 'sequential' ? 'Sequential' : 'Parallel'}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 disabled:opacity-30">↑</button>
              <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="p-1 disabled:opacity-30">↓</button>
            </div>
            {t.depType === 'sequential' && i < items.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
