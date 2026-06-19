import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Repeat } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface TaskKpis {
  pending: number;
  inProgress: number;
  done: number;
  overdue: number;
}

function calcKpis(tasks: any[]): TaskKpis {
  const now = new Date();
  const kpis: TaskKpis = { pending: 0, inProgress: 0, done: 0, overdue: 0 };
  tasks.forEach(t => {
    if (t.status === 'done') kpis.done++;
    else if (t.status === 'in_progress' || t.status === 'review') kpis.inProgress++;
    else if (new Date(t.dueDate) < now) kpis.overdue++;
    else kpis.pending++;
  });
  return kpis;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [delegatedTasks, setDelegatedTasks] = useState<any[]>([]);
  const [redelegatedTasks, setRedelegatedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>('/api/tasks?scope=my'),
      api.get<any>('/api/tasks?scope=delegated'),
      api.get<any>('/api/tasks?scope=redelegated'),
    ]).then(([my, del, red]) => {
      setMyTasks(my.data.tasks || []);
      setDelegatedTasks(del.data.tasks || []);
      setRedelegatedTasks(red.data.tasks || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const myKpis = calcKpis(myTasks);
  const delKpis = calcKpis(delegatedTasks);
  const redKpis = calcKpis(redelegatedTasks);

  const TaskTable = ({ tasks, showAssignee = false }: { tasks: any[]; showAssignee?: boolean }) => (
    <div className="border rounded-lg overflow-hidden mt-3">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Due</th>
            {showAssignee && <th className="text-left p-3 font-medium">Assignee</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.slice(0, 5).map((t: any) => (
            <tr key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="hover:bg-accent/50 cursor-pointer">
              <td className="p-3 font-medium">{t.title}</td>
              <td className="p-3 capitalize">{t.status.replace('_', ' ')}</td>
              <td className="p-3">{new Date(t.dueDate).toLocaleDateString()}</td>
              {showAssignee && <td className="p-3">{t.assignees?.map((a: any) => a.user.name).join(', ') || '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* My Tasks Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">My Tasks</h1>
          <span className="text-sm text-muted-foreground">{myTasks.length} tasks</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Pending" value={myKpis.pending} icon={ClipboardList} color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
          <KpiCard title="In Progress" value={myKpis.inProgress} icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" />
          <KpiCard title="Completed" value={myKpis.done} icon={CheckCircle} color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <KpiCard title="Overdue" value={myKpis.overdue} icon={AlertCircle} color="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" />
        </div>
        {myTasks.length > 0 && <TaskTable tasks={myTasks} />}
      </section>

      {/* Delegated Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Delegated</h2>
          <span className="text-sm text-muted-foreground">{delegatedTasks.length} tasks</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Pending" value={delKpis.pending} icon={ClipboardList} color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
          <KpiCard title="In Progress" value={delKpis.inProgress} icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" />
          <KpiCard title="Completed" value={delKpis.done} icon={CheckCircle} color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <KpiCard title="Overdue" value={delKpis.overdue} icon={AlertCircle} color="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" />
        </div>
        {delegatedTasks.length > 0 && <TaskTable tasks={delegatedTasks} showAssignee />}
      </section>

      {/* Redelegated Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Redelegated</h2>
          <span className="text-sm text-muted-foreground">{redelegatedTasks.length} tasks</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Pending" value={redKpis.pending} icon={ClipboardList} color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
          <KpiCard title="In Progress" value={redKpis.inProgress} icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" />
          <KpiCard title="Completed" value={redKpis.done} icon={CheckCircle} color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
          <KpiCard title="Overdue" value={redKpis.overdue} icon={AlertCircle} color="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" />
        </div>
        {redelegatedTasks.length > 0 && <TaskTable tasks={redelegatedTasks} showAssignee />}
      </section>
    </div>
  );
}
