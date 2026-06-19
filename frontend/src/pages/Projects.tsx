import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectForm } from '../components/projects/ProjectForm';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface Project { id: string; name: string; description: string | null; status: string; creator?: { name: string }; taskCount: number; }

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<{ projects: Project[] }>('/api/projects').then(r => {
      setProjects(r.data.projects);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const createProject = async (data: { name: string; description?: string }) => {
    const res = await api.post('/api/projects', data);
    setProjects(prev => [res.data.project, ...prev]);
  };

  const archiveProject = async (id: string) => {
    await api.delete(`/api/projects/${id}`);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">{projects.length} projects</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.filter(p => p.status === 'active').map(p => (
          <div key={p.id} className="border rounded-lg p-4 bg-card hover:border-primary/50 cursor-pointer transition-colors" onClick={() => navigate(`/projects/${p.id}`)}>
            <h3 className="font-semibold">{p.name}</h3>
            {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{p.taskCount} tasks</span>
              <span>by {p.creator?.name}</span>
            </div>
            <button onClick={e => { e.stopPropagation(); archiveProject(p.id); }} className="text-xs text-destructive mt-2 hover:underline">Archive</button>
          </div>
        ))}
      </div>

      {showForm && <ProjectForm onSave={createProject} onClose={() => setShowForm(false)} />}
    </div>
  );
}
