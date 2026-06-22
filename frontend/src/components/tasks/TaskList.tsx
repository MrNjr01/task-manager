import { Task } from '../../hooks/useTasks';
import { formatDate, cn } from '../../lib/utils';

const statusStyles: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  in_progress: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  done: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
};

const statusLabels: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const priorityStyles: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500 font-medium',
};

interface TaskListProps {
  tasks: Task[];
  viewFilter?: string;
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, viewFilter = 'my', onEdit }: TaskListProps) {
  if (tasks.length === 0) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">No tasks</p>
    </div>
  );

  const getAssignedBy = (t: Task) => t.assignees?.[0]?.assignedByUser?.name || '—';
  const getAssignedTo = (t: Task) => t.assignees?.map(a => a.user.name).join(', ') || '—';

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Priority</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Due</th>
            {viewFilter === 'my' && <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Assigned By</th>}
            {viewFilter === 'delegated' && <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Assigned To</th>}
            {viewFilter === 'redelegated' && (
              <>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Assigned By</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Assigned To</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {tasks.map(t => (
            <tr key={t.id} className="hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => onEdit(t)}>
              <td className="px-4 py-3.5 font-medium">{t.title}</td>
              <td className="px-4 py-3.5">
                <span className={cn('inline-flex px-2.5 py-1 rounded-lg text-xs font-medium', statusStyles[t.status])}>
                  {statusLabels[t.status]}
                </span>
              </td>
              <td className={cn('px-4 py-3.5 capitalize text-xs font-medium', priorityStyles[t.priority])}>{t.priority}</td>
              <td className="px-4 py-3.5 text-muted-foreground">{formatDate(t.dueDate)}</td>
              {viewFilter === 'my' && <td className="px-4 py-3.5 text-muted-foreground">{getAssignedBy(t)}</td>}
              {viewFilter === 'delegated' && <td className="px-4 py-3.5">{getAssignedTo(t)}</td>}
              {viewFilter === 'redelegated' && (
                <>
                  <td className="px-4 py-3.5 text-muted-foreground">{getAssignedBy(t)}</td>
                  <td className="px-4 py-3.5">{getAssignedTo(t)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
