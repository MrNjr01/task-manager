import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskSequencer } from '../components/projects/TaskSequencer';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskTree } from '../components/tasks/TaskTree';
import { useTasks } from '../hooks/useTasks';
import { api } from '../lib/api';
import { Plus, Calendar } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const { tasks, loading, createTask, updateTask } = useTasks({ project: id || '' });

  useEffect(() => {
    api.get<any>(`/api/projects/${id}`).then(r => setProject(r.data.project)).catch(() => {});
    api.get<any>('/api/users/active').then(r => setUsers(r.data.users)).catch(() => {});
  }, [id]);

  const handleReorder = async (updates: { id: string; orderIndex: number; depType: string }[]) => {
    for (const u of updates) {
      await updateTask(u.id, { orderIndex: u.orderIndex, depType: u.depType });
    }
  };

  const addSubtask = (task: any) => {
    setSelectedParent(task);
    setShowTaskForm(true);
  };

  if (!project) return <div className="text-center py-8">Loading project...</div>;

  // Calculate project timeline from tasks
  const projectStartDate = tasks.length > 0 ? Math.min(...tasks.map((t: any) => new Date(t.startDate).getTime())) : Date.now();
  const projectEndDate = tasks.length > 0 ? Math.max(...tasks.map((t: any) => new Date(t.dueDate).getTime())) : Date.now() + 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/projects')} className="text-sm text-muted-foreground hover:text-foreground mb-1">← Back to Projects</button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="text-muted-foreground">{project.description}</p>}
          {/* Project timeline */}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(projectStartDate).toLocaleDateString()} — {new Date(projectEndDate).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={() => { setSelectedParent(null); setShowTaskForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <TaskSequencer tasks={tasks as any} onReorder={handleReorder} />

      <div>
        <h2 className="text-lg font-semibold mb-3">Tasks</h2>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            {tasks.filter((t: any) => !t.parentTaskId).map((task: any) => (
              <div key={task.id} className="border rounded-lg overflow-hidden">
                {/* Parent task header */}
                <div className="flex items-center justify-between p-3 bg-muted/50">
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => navigate(`/tasks/${task.id}`)}>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="font-medium">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{new Date(task.startDate).toLocaleDateString()} — {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => addSubtask(task)} className="text-xs text-blue-600 hover:underline px-2 py-1">+ Subtask</button>
                </div>
                {/* Subtasks */}
                {tasks.filter((t: any) => t.parentTaskId === task.id).length > 0 && (
                  <div className="border-t divide-y">
                    {tasks.filter((t: any) => t.parentTaskId === task.id).map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 pl-8 hover:bg-accent/30 cursor-pointer" onClick={() => navigate(`/tasks/${sub.id}`)}>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">└</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            sub.status === 'done' ? 'bg-green-100 text-green-700' :
                            sub.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {sub.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm">{sub.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.dueDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          users={users}
          projects={[{ id: id!, name: project.name }]}
          parentTask={selectedParent}
          projectStart={new Date(projectStartDate)}
          projectEnd={new Date(projectEndDate)}
          onSave={createTask}
          onClose={() => { setShowTaskForm(false); setSelectedParent(null); }}
        />
      )}
    </div>
  );
}
