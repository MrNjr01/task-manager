import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTasks, Task } from '../hooks/useTasks';
import { ViewSwitcher, ViewMode } from '../components/tasks/ViewSwitcher';
import { TaskList } from '../components/tasks/TaskList';
import { TaskKanban } from '../components/tasks/TaskKanban';
import { TaskTree } from '../components/tasks/TaskTree';
import { TaskForm } from '../components/tasks/TaskForm';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Tasks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const viewFilter = searchParams.get('view') || 'my';
  const [view, setView] = useState<ViewMode>('list');
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const { tasks, loading, createTask, updateTask } = useTasks();

  useEffect(() => {
    api.get<any>('/api/users').then(r => setUsers(r.data.users)).catch(() => setUsers([]));
    api.get<any>('/api/projects').then(r => setProjects(r.data.projects)).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    setAllTasks(tasks);
  }, [tasks]);

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try { await updateTask(taskId, { status }); } catch {}
  };

  // Filter tasks based on view
  const filteredTasks = allTasks.filter(t => {
    if (viewFilter === 'my') return true; // all assigned to me
    if (viewFilter === 'delegated') {
      return t.assignees?.some((a: any) => a.assignedByUser?.id === user?.id && a.user.id !== user?.id);
    }
    if (viewFilter === 'redelegated') {
      return t.assignees?.some((a: any) => a.user.id === user?.id && a.assignedByUser?.id !== user?.id && a.assignedByUser?.id);
    }
    return true;
  });

  const viewTitle = viewFilter === 'my' ? 'My Tasks' : viewFilter === 'delegated' ? 'Delegated Tasks' : 'Redelegated Tasks';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{viewTitle}</h1>
          <p className="text-muted-foreground">{filteredTasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher mode={view} onChange={setView} />
          <button onClick={() => { setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading tasks...</div>}

      {view === 'list' && !loading && <TaskList tasks={filteredTasks} onEdit={t => navigate(`/tasks/${t.id}`)} />}
      {view === 'kanban' && !loading && <TaskKanban tasks={filteredTasks} onEdit={t => navigate(`/tasks/${t.id}`)} onStatusChange={handleStatusChange} />}
      {view === 'tree' && !loading && <TaskTree tasks={filteredTasks} onEdit={t => navigate(`/tasks/${t.id}`)} />}

      {showForm && (
        <TaskForm
          users={users}
          projects={projects}
          onSave={createTask}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
