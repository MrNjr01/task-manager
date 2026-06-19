import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    api.get<any>('/api/tasks').then(r => setTasks(r.data.tasks)).catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => {
      const due = new Date(t.dueDate);
      return due.getFullYear() === year && due.getMonth() === month && due.getDate() === day;
    });
  };

  const statusColors: Record<string, string> = {
    todo: 'bg-slate-500',
    in_progress: 'bg-amber-500',
    review: 'bg-blue-500',
    done: 'bg-green-500',
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'month' ? 'week' : 'month')} className="px-3 py-1 border rounded-md text-sm">
            {view === 'month' ? 'Week' : 'Month'}
          </button>
          <button onClick={prevMonth} className="p-2 hover:bg-accent rounded-md"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-medium min-w-[140px] text-center">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-accent rounded-md"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {dayNames.map(d => (
            <div key={d} className="p-2 text-center text-sm font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => (
            <div key={i} className="min-h-[100px] border-t border-r p-1">
              {day && (
                <>
                  <span className="text-sm font-medium">{day}</span>
                  <div className="space-y-0.5 mt-1">
                    {getTasksForDate(day).slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className={`text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer ${statusColors[t.status] || 'bg-slate-500'}`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {getTasksForDate(day).length > 3 && (
                      <span className="text-xs text-muted-foreground">+{getTasksForDate(day).length - 3} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-500" /> Todo</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> In Progress</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Review</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Done</span>
      </div>
    </div>
  );
}
