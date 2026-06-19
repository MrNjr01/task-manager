import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, ListTodo, FolderKanban, Users, ChevronDown, ChevronRight, User, Send, Repeat } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

const taskSubItems = [
  { to: '/tasks?view=my', icon: User, label: 'My Tasks', filter: 'my' },
  { to: '/tasks?view=delegated', icon: Send, label: 'Delegated', filter: 'delegated' },
  { to: '/tasks?view=redelegated', icon: Repeat, label: 'Redelegated', filter: 'redelegated' },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tasksOpen, setTasksOpen] = useState(location.pathname.startsWith('/tasks'));

  const isActive = (path: string) => location.pathname === path;
  const isTaskActive = (filter: string) => location.pathname.startsWith('/tasks') && searchParams.get('view') === filter;

  return (
    <aside className="w-64 min-h-screen border-r bg-card p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Simple Task Manager</h1>
        <p className="text-sm text-muted-foreground">{user?.department}</p>
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              isActive(to) ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}

        {/* Tasks with sub-navigation */}
        <div>
          <button
            onClick={() => setTasksOpen(!tasksOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              location.pathname.startsWith('/tasks') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <ListTodo className="w-5 h-5" />
            <span className="flex-1 text-left">Tasks</span>
            {tasksOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {tasksOpen && (
            <div className="ml-8 mt-1 space-y-0.5">
              {taskSubItems.map(({ to, icon: Icon, label, filter }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
                    isTaskActive(filter) ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              isActive('/admin') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <Users className="w-5 h-5" />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  );
}
