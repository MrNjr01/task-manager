import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskSequencer } from '../components/projects/TaskSequencer';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskTree } from '../components/tasks/TaskTree';
import { useTasks } from '../hooks/useTasks';
import { api } from '../lib/api';
import { Plus } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { tasks, loading, createTask, updateTask } = useTasks({ project: id || '' });

  useEffect(() => {
    api.get<any>(`/api/projects/${id}`).then(r => setProject(r.data.project)).catch(() => {});
    api.get<any>('/api/users').then(r => setUsers(r.data.users)).catch(() => {});
  }, [id]);

  const handleReorder = async (updates: { id: string; orderIndex: number; depType: string }[]) => {
    for (const u of updates) {
      await updateTask(u.id, { orderIndex: u.orderIndex, depType: u.depType });
    }
  };

  if (!project) return <div className="text-center py-8">Loading project...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/projects')} className="text-sm text-muted-foreground hover:text-foreground mb-1">← Back to Projects</button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="text-muted-foreground">{project.description}</p>}
        </div>
        <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <TaskSequencer tasks={tasks as any} onReorder={handleReorder} />

      <div>
        <h2 className="text-lg font-semibold mb-3">Tasks</h2>
        {loading ? <div>Loading...</div> : <TaskTree tasks={tasks} onEdit={() => {}} />}
      </div>

      {showTaskForm && (
        <TaskForm
          users={users}
          projects={[{ id: id!, name: project.name }]}
          onSave={createTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}
