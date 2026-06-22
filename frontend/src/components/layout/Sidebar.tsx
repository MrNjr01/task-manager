import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, User, Send, Repeat, FolderKanban, Users, Info, HelpCircle, CheckSquare, Palette } from 'lucide-react';
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
    <aside className="w-64 min-h-screen border-r bg-card/50 backdrop-blur-xl p-3 flex flex-col">
      <div className="mb-6 px-3 pt-2">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Simple Task Manager</h1>
        </div>
        <p className="text-xs text-muted-foreground ml-11">{user?.department}</p>
      </div>

      <nav className="space-y-0.5 flex-1">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} />
        <NavItem to="/tasks?view=my" icon={User} label="My Tasks" active={isActive('/tasks', 'my')} />
        <NavItem to="/tasks?view=delegated" icon={Send} label="Delegated" active={isActive('/tasks', 'delegated')} />
        <NavItem to="/tasks?view=redelegated" icon={Repeat} label="Redelegated" active={isActive('/tasks', 'redelegated')} />
        <NavItem to="/projects" icon={FolderKanban} label="Projects" active={isActive('/projects')} />
        <NavItem to="/calendar" icon={HelpCircle} label="Calendar" active={isActive('/calendar')} />
        {user?.role === 'admin' && (
          <>
            <NavItem to="/admin" icon={Users} label="Admin" active={isActive('/admin')} />
            <NavItem to="/customize" icon={Palette} label="Customize" active={isActive('/customize')} />
          </>
        )}
      </nav>

      <div className="border-t pt-3 mt-2 space-y-0.5">
        <NavItem to="/about" icon={Info} label="About" subtle />
        <NavItem to="/help" icon={HelpCircle} label="Help" subtle />
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label, active, subtle }: { to: string; icon: any; label: string; active?: boolean; subtle?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
        active
          ? 'bg-primary text-primary-foreground font-medium shadow-sm'
          : subtle
            ? 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      )}
    >
      <Icon className={cn('w-4.5 h-4.5 transition-transform group-hover:scale-110', active ? 'text-primary-foreground' : '')} />
      {label}
    </Link>
  );
}
