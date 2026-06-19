import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface Task {
  id: string;
  projectId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  startDate: string;
  depType: 'none' | 'sequential' | 'parallel';
  orderIndex: number;
  createdBy: string;
  assignees: { user: { id: string; name: string; email: string }; assignedByUser: { id: string; name: string } }[];
  project?: { id: string; name: string } | null;
}

export function useTasks(filters?: Record<string, string>) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    const qs = new URLSearchParams(filters as any).toString();
    api.get<{ tasks: Task[] }>(`/api/tasks?${qs}`).then(res => {
      setTasks(res.data.tasks);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [JSON.stringify(filters)]);

  const createTask = async (data: any) => {
    const res = await api.post('/api/tasks', data);
    fetchTasks();
    return res;
  };

  const updateTask = async (id: string, data: any) => {
    const res = await api.put(`/api/tasks/${id}`, data);
    fetchTasks();
    return res;
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/api/tasks/${id}`);
    fetchTasks();
  };

  return { tasks, loading, createTask, updateTask, deleteTask, refresh: fetchTasks };
}
