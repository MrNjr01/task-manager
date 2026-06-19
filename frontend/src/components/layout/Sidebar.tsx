import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, User, Send, Repeat, FolderKanban, Users, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view');

  const isActive = (path: string, view?: string) => {
    if (view) {
      return location.pathname === '/tasks' && currentView === view;
    }
    return location.pathname === path;
  };

  return (
    <aside className="w-64 min-h-screen border-r bg-card p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Simple Task Manager</h1>
        <p className="text-sm text-muted-foreground">{user?.department}</p>
      </div>
      <nav className="space-y-1 flex-1">
        <Link to="/dashboard" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/dashboard') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link to="/tasks?view=my" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/tasks', 'my') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
          <User className="w-5 h-5" />
          My Tasks
        </Link>
        <Link to="/tasks?view=delegated" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/tasks', 'delegated') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
          <Send className="w-5 h-5" />
          Delegated
        </Link>
        <Link to="/tasks?view=redelegated" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/tasks', 'redelegated') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
          <Repeat className="w-5 h-5" />
          Redelegated
        </Link>
        <Link to="/projects" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/projects') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
          <FolderKanban className="w-5 h-5" />
          Projects
        </Link>
        <Link to="/calendar" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/calendar') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
          <HelpCircle className="w-5 h-5" />
          Calendar
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive('/admin') ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent')}>
            <Users className="w-5 h-5" />
            Admin
          </Link>
        )}
      </nav>
      <div className="border-t pt-4 mt-4 space-y-1">
        <Link to="/about" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
          <Info className="w-5 h-5" />
          About
        </Link>
        <Link to="/help" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
          <HelpCircle className="w-5 h-5" />
          Help
        </Link>
      </div>
    </aside>
  );
}
