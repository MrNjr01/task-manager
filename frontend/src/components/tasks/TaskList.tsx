import { Task } from '../../hooks/useTasks';
import { formatDate, cn } from '../../lib/utils';

const statusColors: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const statusLabels: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

interface TaskListProps {
  tasks: Task[];
  viewFilter?: string;
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, viewFilter = 'my', onEdit }: TaskListProps) {
  if (tasks.length === 0) return <div className="text-center text-muted-foreground py-8">No tasks</div>;

  const getAssignedBy = (t: Task) => t.assignees?.[0]?.assignedByUser?.name || '—';
  const getAssignedTo = (t: Task) => t.assignees?.map(a => a.user.name).join(', ') || '—';

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Priority</th>
            <th className="text-left p-3 font-medium">Due</th>
            {viewFilter === 'my' && <th className="text-left p-3 font-medium">Assigned By</th>}
            {viewFilter === 'delegated' && <th className="text-left p-3 font-medium">Assigned To</th>}
            {viewFilter === 'redelegated' && (
              <>
                <th className="text-left p-3 font-medium">Assigned By</th>
                <th className="text-left p-3 font-medium">Assigned To</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map(t => (
            <tr key={t.id} className="hover:bg-accent/50 cursor-pointer" onClick={() => onEdit(t)}>
              <td className="p-3 font-medium">{t.title}</td>
              <td className="p-3"><span className={cn('px-2 py-0.5 rounded-full text-xs', statusColors[t.status])}>{statusLabels[t.status]}</span></td>
              <td className="p-3 capitalize">{t.priority}</td>
              <td className="p-3">{formatDate(t.dueDate)}</td>
              {viewFilter === 'my' && <td className="p-3">{getAssignedBy(t)}</td>}
              {viewFilter === 'delegated' && <td className="p-3">{getAssignedTo(t)}</td>}
              {viewFilter === 'redelegated' && (
                <>
                  <td className="p-3">{getAssignedBy(t)}</td>
                  <td className="p-3">{getAssignedTo(t)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
