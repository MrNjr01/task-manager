import { Task } from '../../hooks/useTasks';
import { TaskCard } from './TaskCard';

const columns: { status: Task['status']; label: string }[] = [
  { status: 'todo', label: 'Todo' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'review', label: 'Review' },
  { status: 'done', label: 'Done' },
];

interface TaskKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export function TaskKanban({ tasks, onEdit, onStatusChange }: TaskKanbanProps) {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onStatusChange(taskId, status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => (
        <div
          key={col.status}
          className="min-w-[280px] flex-1 bg-muted/50 rounded-lg p-3"
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, col.status)}
        >
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            {col.label}
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{tasks.filter(t => t.status === col.status).length}</span>
          </h3>
          <div className="space-y-2">
            {tasks.filter(t => t.status === col.status).map(t => (
              <div key={t.id} draggable onDragStart={e => handleDragStart(e, t.id)}>
                <TaskCard task={t} onEdit={onEdit} compact />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
