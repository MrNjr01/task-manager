import { Task } from '../../hooks/useTasks';
import { formatDate, isOverdue, cn } from '../../lib/utils';
import { Flag, Calendar } from 'lucide-react';

const priorityColors: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, compact = false }: TaskCardProps) {
  const overdue = task.status !== 'done' && isOverdue(task.dueDate);

  return (
    <div onClick={() => onEdit?.(task)} className={cn('border rounded-lg bg-card p-3 cursor-pointer hover:bg-accent/50', overdue && 'border-red-300 dark:border-red-800')}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm truncate">{task.title}</h4>
        <Flag className={cn('w-4 h-4 flex-shrink-0', priorityColors[task.priority])} />
      </div>
      {!compact && task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(task.dueDate)}</span>
        {task.assignees.length > 0 && (
          <span>{task.assignees.map(a => a.user.name.split(' ')[0]).join(', ')}</span>
        )}
      </div>
    </div>
  );
}
