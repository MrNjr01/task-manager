import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Play, Check, Repeat } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showRedelegate, setShowRedelegate] = useState(false);
  const [redelegateTo, setRedelegateTo] = useState('');

  useEffect(() => {
    if (id) {
      api.get<any>(`/api/tasks/${id}`).then(r => {
        setTask(r.data.task);
        setLoading(false);
      }).catch(() => setLoading(false));
      api.get<any>('/api/users').then(r => setAllUsers(r.data.users)).catch(() => {});
    }
  }, [id]);

  const updateStatus = async (status: string) => {
    await api.patch(`/api/tasks/${id}/status`, { status });
    api.get<any>(`/api/tasks/${id}`).then(r => setTask(r.data.task));
  };

  const redelegate = async () => {
    if (!redelegateTo || !task) return;
    const currentAssignee = task.assignees?.find((a: any) => a.user.id === user?.id);
    if (!currentAssignee) return;
    await api.post(`/api/tasks/${id}/redelegate`, {
      fromUserId: user?.id,
      toUserId: redelegateTo,
    });
    navigate('/tasks');
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!task) return <div className="text-center py-8">Task not found</div>;

  const currentAssignee = task.assignees?.find((a: any) => a.user.id === user?.id);
  const isAssigned = !!currentAssignee;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            {task.description && <p className="text-muted-foreground mt-1">{task.description}</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            task.status === 'done' ? 'bg-green-100 text-green-700' :
            task.status === 'in_progress' || task.status === 'review' ? 'bg-amber-100 text-amber-700' :
            task.status === 'todo' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Priority:</span>
            <span className="ml-2 capitalize font-medium">{task.priority}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Due:</span>
            <span className="ml-2">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Start:</span>
            <span className="ml-2">{new Date(task.startDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created by:</span>
            <span className="ml-2">{task.assignees?.[0]?.assignedByUser?.name || '—'}</span>
          </div>
        </div>

        <div>
          <span className="text-muted-foreground text-sm">Assignees:</span>
          <div className="flex gap-2 mt-1">
            {task.assignees?.map((a: any) => (
              <span key={a.user.id} className="px-2 py-1 bg-muted rounded text-sm">{a.user.name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isAssigned && task.status !== 'done' && (
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {task.status === 'todo' && (
              <button onClick={() => updateStatus('in_progress')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                <Play className="w-4 h-4" /> Mark In Progress
              </button>
            )}
            {(task.status === 'todo' || task.status === 'in_progress' || task.status === 'review') && (
              <button onClick={() => updateStatus('done')} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                <Check className="w-4 h-4" /> Mark Complete
              </button>
            )}
            {task.status === 'in_progress' && (
              <button onClick={() => updateStatus('review')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Send for Review
              </button>
            )}
            <button onClick={() => setShowRedelegate(!showRedelegate)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
              <Repeat className="w-4 h-4" /> Redelegate
            </button>
          </div>

          {showRedelegate && (
            <div className="border rounded-lg p-4 space-y-3">
              <label className="text-sm font-medium">Redelegate to:</label>
              <select value={redelegateTo} onChange={e => setRedelegateTo(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
                <option value="">Select user</option>
                {allUsers.filter(u => u.id !== user?.id && u.isActive).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                ))}
              </select>
              <button onClick={redelegate} disabled={!redelegateTo} className="px-4 py-2 bg-purple-500 text-white rounded-md disabled:opacity-50">
                Confirm Redelegation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
