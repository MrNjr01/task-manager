import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, FolderKanban, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen border-r bg-card p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Simple Task Manager</h1>
        <p className="text-sm text-muted-foreground">{user?.department}</p>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              location.pathname === to ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              location.pathname === '/admin' ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
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
