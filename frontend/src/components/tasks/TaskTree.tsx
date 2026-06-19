import { useState } from 'react';
import { Task } from '../../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { ChevronRight, ChevronDown } from 'lucide-react';

function TreeNode({ task, tasks, onEdit, depth = 0 }: { task: Task; tasks: Task[]; onEdit: (t: Task) => void; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const subtasks = tasks.filter(t => t.parentTaskId === task.id);
  const hasSubtasks = subtasks.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 24}px` }}>
        {hasSubtasks ? (
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-accent rounded">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-6" />
        )}
        <div className="flex-1">
          <TaskCard task={task} onEdit={onEdit} />
        </div>
      </div>
      {expanded && hasSubtasks && (
        <div className="mt-1">
          {subtasks.map(st => (
            <TreeNode key={st.id} task={st} tasks={tasks} onEdit={onEdit} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TaskTreeProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TaskTree({ tasks, onEdit }: TaskTreeProps) {
  const rootTasks = tasks.filter(t => !t.parentTaskId);
  if (rootTasks.length === 0) return <div className="text-center text-muted-foreground py-8">No tasks</div>;

  return (
    <div className="space-y-2">
      {rootTasks.map(t => (
        <TreeNode key={t.id} task={t} tasks={tasks} onEdit={onEdit} />
      ))}
    </div>
  );
}
