import { ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { api } from '../../lib/api';
import { useEffect, useState } from 'react';

interface MyKpiData {
  pending: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export function MyKpis() {
  const [data, setData] = useState<MyKpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<MyKpiData>('/api/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><div className="h-24 border rounded-lg animate-pulse" /></div>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Pending" value={data.pending} icon={ClipboardList} color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" />
      <KpiCard title="In Progress" value={data.inProgress} icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" />
      <KpiCard title="Completed" value={data.done} icon={CheckCircle} color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" />
      <KpiCard title="Overdue" value={data.overdue} icon={AlertCircle} color="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" />
    </div>
  );
}
