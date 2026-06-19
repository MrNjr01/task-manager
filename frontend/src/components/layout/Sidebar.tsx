import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, User, Send, Repeat, FolderKanban, Users, InfoCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks?view=my', icon: User, label: 'My Tasks', view: 'my' },
  { to: '/tasks?view=delegated', icon: Send, label: 'Delegated', view: 'delegated' },
  { to: '/tasks?view=redelegated', icon: Repeat, label: 'Redelegated', view: 'redelegated' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/calendar', icon: HelpCircle, label: 'Calendar', view: 'calendar' },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isActive = (item: any) => {
    if (item.view) {
      return location.pathname.startsWith('/tasks') && searchParams.get('view') === item.view;
    }
    return location.pathname === item.to;
  };

  return (
    <aside className="w-64 min-h-screen border-r bg-card p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Simple Task Manager</h1>
        <p className="text-sm text-muted-foreground">{user?.department}</p>
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map(({ to, icon: Icon, label, view }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              isActive({ view }) ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent'
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
      <div className="border-t pt-4 mt-4 space-y-1">
        <Link to="/about" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
          <InfoCircle className="w-5 h-5" />
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
