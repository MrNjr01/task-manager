import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const scopeMap: Record<string, string> = { my: 'my', delegated: 'delegated', redelegated: 'redelegated' };
  const { tasks, loading, createTask, updateTask } = useTasks({ scope: scopeMap[viewFilter] || 'my' });

  useEffect(() => {
    api.get<any>('/api/users/active').then(r => setUsers(r.data.users)).catch(() => setUsers([]));
    api.get<any>('/api/projects').then(r => setProjects(r.data.projects)).catch(() => setProjects([]));
  }, []);

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try { await updateTask(taskId, { status }); } catch {}
  };

  // Apply filters
  const filtered = tasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    const mul = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'dueDate') return mul * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    if (sortBy === 'priority') {
      const order = { low: 1, medium: 2, high: 3, urgent: 4 };
      return mul * ((order[a.priority] || 0) - (order[b.priority] || 0));
    }
    if (sortBy === 'status') return mul * a.status.localeCompare(b.status);
    if (sortBy === 'title') return mul * a.title.localeCompare(b.title);
    return 0;
  });

  const viewTitle = viewFilter === 'my' ? 'My Tasks' : viewFilter === 'delegated' ? 'Delegated' : 'Redelegated';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{viewTitle}</h1>
          <p className="text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-md border ${showFilters ? 'bg-accent' : ''}`}>
            <Filter className="w-4 h-4" />
          </button>
          <div className="flex items-center border rounded-md">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-2 py-1.5 text-sm bg-transparent border-r">
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
            <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="px-2 py-1.5 hover:bg-accent">
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
          <ViewSwitcher mode={view} onChange={setView} />
          <button onClick={() => { setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="flex gap-3 p-3 border rounded-lg bg-card">
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-background">
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-background">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input type="text" placeholder="Search tasks..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-background flex-1" />
          <button onClick={() => setFilters({ status: '', priority: '', search: '' })} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      {loading && <div className="text-center py-8">Loading tasks...</div>}

      {view === 'list' && !loading && <TaskList tasks={sorted} viewFilter={viewFilter} onEdit={t => navigate(`/tasks/${t.id}`)} />}
      {view === 'kanban' && !loading && <TaskKanban tasks={sorted} onEdit={t => navigate(`/tasks/${t.id}`)} onStatusChange={handleStatusChange} />}
      {view === 'tree' && !loading && <TaskTree tasks={sorted} onEdit={t => navigate(`/tasks/${t.id}`)} />}

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
