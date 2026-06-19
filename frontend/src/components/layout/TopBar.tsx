import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { LogOut } from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.designation}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-md hover:bg-accent text-muted-foreground" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
