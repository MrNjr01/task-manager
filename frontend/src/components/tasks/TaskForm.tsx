import { useState } from 'react';
import { AssigneePicker } from './AssigneePicker';

interface User { id: string; name: string; email: string; department: string; }

interface TaskFormProps {
  task?: any;
  users: User[];
  projects: { id: string; name: string }[];
  parentTask?: any;
  projectStart?: Date;
  projectEnd?: Date;
  onSave: (data: any) => void;
  onClose: () => void;
}

export function TaskForm({ task, users, projects, parentTask, projectStart, projectEnd, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [projectId, setProjectId] = useState(task?.projectId || parentTask ? parentTask.projectId || '' : '');
  const [parentTaskId, setParentTaskId] = useState(task?.parentTaskId || parentTask?.id || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [startDate, setStartDate] = useState(task?.startDate ? task.startDate.slice(0, 10) : '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assignees?.map((a: any) => a.user.id) || []);
  const [error, setError] = useState('');

  // Subtask date constraints
  const minDate = parentTask ? parentTask.startDate.slice(0, 10) : (projectStart ? projectStart.toISOString().slice(0, 10) : '');
  const maxDate = parentTask ? parentTask.dueDate.slice(0, 10) : (projectEnd ? projectEnd.toISOString().slice(0, 10) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigneeIds.length === 0) { setError('At least one assignee is required'); return; }
    if (!startDate || !dueDate) { setError('Start and due dates are required'); return; }
    if (new Date(dueDate) < new Date(startDate)) { setError('Due date must be after start date'); return; }
    if (parentTask) {
      if (new Date(startDate) < new Date(parentTask.startDate)) { setError('Subtask start date must be on or after parent task start'); return; }
      if (new Date(dueDate) > new Date(parentTask.dueDate)) { setError('Subtask due date must be on or before parent task due date'); return; }
    }
    onSave({
      title, description: description || undefined,
      projectId: projectId || undefined, parentTaskId: parentTaskId || undefined,
      priority, startDate: new Date(startDate).toISOString(), dueDate: new Date(dueDate).toISOString(),
      assigneeIds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">{parentTask ? `Add Subtask to "${parentTask.title}"` : task ? 'Edit Task' : 'Create Task'}</h2>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {parentTask && (
          <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Subtask must be between {parentTask.startDate.slice(0, 10)} and {parentTask.dueDate.slice(0, 10)}
          </p>
        )}
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Project</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={minDate || undefined} max={maxDate || undefined} required className="w-full px-3 py-2 border rounded-md bg-background" />
          </div>
          <div>
            <label className="text-sm font-medium">Due Date *</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={minDate || startDate || undefined} max={maxDate || undefined} required className="w-full px-3 py-2 border rounded-md bg-background" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Assignees * (at least one)</label>
          <AssigneePicker users={users} selectedIds={assigneeIds} onChange={setAssigneeIds} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save</button>
        </div>
      </form>
    </div>
  );
}
