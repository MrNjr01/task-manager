import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Play, Check, Repeat, Trash2, Pencil, Save, X, ExternalLink, Calendar, Flag } from 'lucide-react';
import { AssigneePicker } from '../components/tasks/AssigneePicker';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showRedelegate, setShowRedelegate] = useState(false);
  const [redelegateTo, setRedelegateTo] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (id) {
      api.get<any>(`/api/tasks/${id}`).then(r => {
        setTask(r.data.task);
        setEditForm({
          title: r.data.task.title,
          description: r.data.task.description || '',
          priority: r.data.task.priority,
          startDate: r.data.task.startDate.slice(0, 10),
          dueDate: r.data.task.dueDate.slice(0, 10),
        });
        setLoading(false);
      }).catch(() => setLoading(false));
      api.get<any>('/api/users/active').then(r => setAllUsers(r.data.users)).catch(() => {});
    }
  }, [id]);

  const updateStatus = async (status: string) => {
    await api.patch(`/api/tasks/${id}/status`, { status });
    api.get<any>(`/api/tasks/${id}`).then(r => setTask(r.data.task));
  };

  const saveEdit = async () => {
    await api.put(`/api/tasks/${id}`, {
      title: editForm.title,
      description: editForm.description || undefined,
      priority: editForm.priority,
      startDate: new Date(editForm.startDate).toISOString(),
      dueDate: new Date(editForm.dueDate).toISOString(),
    });
    api.get<any>(`/api/tasks/${id}`).then(r => { setTask(r.data.task); setEditing(false); });
  };

  const redelegate = async () => {
    if (!redelegateTo || !task) return;
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
  const isCreator = task.createdBy === user?.id;
  const canEdit = task.status !== 'done' && (isCreator || isAssigned);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Reference task link for redelegated tasks */}
      {task.referenceTaskId && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <ExternalLink className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300">This is a redelegation of</span>
          <button onClick={() => navigate(`/tasks/${task.referenceTaskId}`)} className="text-sm text-blue-600 hover:underline font-medium">
            Original Task →
          </button>
        </div>
      )}

      <div className="border rounded-xl p-6 space-y-4 bg-card">
        {/* Title and status */}
        <div className="flex items-start justify-between gap-4">
          {editing ? (
            <input
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              className="text-2xl font-bold bg-background border rounded-lg px-3 py-1 flex-1 focus:ring-2 focus:ring-ring outline-none"
            />
          ) : (
            <h1 className="text-2xl font-bold">{task.title}</h1>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize shrink-0 ${
            task.status === 'done' ? 'bg-green-100 text-green-700' :
            task.status === 'in_progress' || task.status === 'review' ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        {editing ? (
          <textarea
            value={editForm.description}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
            placeholder="Description..."
          />
        ) : (
          task.description && <p className="text-muted-foreground">{task.description}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-muted-foreground" />
            {editing ? (
              <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} className="flex-1 bg-background border rounded px-2 py-1 capitalize">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            ) : (
              <span className="capitalize font-medium">{task.priority}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {editing ? (
              <div className="flex gap-2 flex-1">
                <input type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} className="flex-1 bg-background border rounded px-2 py-1 text-xs" />
                <input type="date" value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} className="flex-1 bg-background border rounded px-2 py-1 text-xs" />
              </div>
            ) : (
              <span>{new Date(task.startDate).toLocaleDateString()} — {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Created by:</span>
            <span className="ml-2">{task.assignees?.[0]?.assignedByUser?.name || '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Assignees:</span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {task.assignees?.map((a: any) => (
                <span key={a.user.id} className="px-2 py-0.5 bg-muted rounded text-xs">{a.user.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Edit actions */}
        {canEdit && (
          <div className="flex gap-2 pt-2">
            {editing ? (
              <>
                <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-accent">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isAssigned && task.status !== 'done' && (
        <div className="border rounded-xl p-6 space-y-4 bg-card">
          <h2 className="font-semibold">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {task.status === 'todo' && (
              <button onClick={() => updateStatus('in_progress')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                <Play className="w-4 h-4" /> Mark In Progress
              </button>
            )}
            {(task.status === 'todo' || task.status === 'in_progress' || task.status === 'review') && (
              <button onClick={() => updateStatus('done')} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                <Check className="w-4 h-4" /> Mark Complete
              </button>
            )}
            {task.status === 'in_progress' && (
              <button onClick={() => updateStatus('review')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Send for Review
              </button>
            )}
            <button onClick={() => setShowRedelegate(!showRedelegate)} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <Repeat className="w-4 h-4" /> Redelegate
            </button>
          </div>

          {isCreator && task.status === 'todo' && (
            <div className="border-t pt-4">
              <button onClick={() => { if (confirm('Delete this task?')) { api.delete(`/api/tasks/${id}`).then(() => navigate('/tasks')); } }} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
            </div>
          )}

          {showRedelegate && (
            <div className="border rounded-lg p-4 space-y-3">
              <label className="text-sm font-medium">Redelegate to:</label>
              <select value={redelegateTo} onChange={e => setRedelegateTo(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background">
                <option value="">Select user</option>
                {allUsers.filter(u => u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name} — {u.department}</option>
                ))}
              </select>
              <button onClick={redelegate} disabled={!redelegateTo} className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50">
                Confirm Redelegation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
