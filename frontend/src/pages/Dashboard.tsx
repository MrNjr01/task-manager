import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyKpis } from '../components/dashboard/MyKpis';
import { DelegatedKpis } from '../components/dashboard/DelegatedKpis';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [delegatedTasks, setDelegatedTasks] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>('/api/tasks').then(r => setMyTasks(r.data.tasks)).catch(() => {});
    if (user?.role === 'admin') {
      api.get<any>('/api/tasks').then(r => {
        const delegated = r.data.tasks.filter((t: any) =>
          t.assignees?.some((a: any) => a.assignedByUser?.id === user.id && a.user.id !== user.id)
        );
        setDelegatedTasks(delegated);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mb-4">Your task overview and progress</p>
        <MyKpis />
        <div className="mt-4">
          <h3 className="font-semibold mb-2">All My Tasks</h3>
          {myTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tasks assigned to you</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Priority</th>
                    <th className="text-left p-3 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myTasks.slice(0, 10).map((t: any) => (
                    <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="hover:bg-accent/50 cursor-pointer">
                      <td className="p-3 font-medium">{t.title}</td>
                      <td className="p-3 capitalize">{t.status.replace('_', ' ')}</td>
                      <td className="p-3 capitalize">{t.priority}</td>
                      <td className="p-3">{new Date(t.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mt-8 mb-4">Delegated Tasks</h2>
        <p className="text-muted-foreground mb-4">Tasks you assigned to others</p>
        <DelegatedKpis />
        <div className="mt-4">
          <h3 className="font-semibold mb-2">All Delegated Tasks</h3>
          {delegatedTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tasks delegated</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Assignee</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {delegatedTasks.slice(0, 10).map((t: any) => {
                    const assignee = t.assignees?.find((a: any) => a.user.id !== user?.id);
                    return (
                      <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="hover:bg-accent/50 cursor-pointer">
                        <td className="p-3 font-medium">{t.title}</td>
                        <td className="p-3">{assignee?.user?.name || '—'}</td>
                        <td className="p-3 capitalize">{t.status.replace('_', ' ')}</td>
                        <td className="p-3">{new Date(t.dueDate).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
