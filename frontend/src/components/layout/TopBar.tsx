import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, UserCircle } from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">{user?.designation}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
