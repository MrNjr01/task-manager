import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const modes: { value: 'light' | 'dark' | 'system'; icon: typeof Sun }[] = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ];

  return (
    <div className="flex items-center gap-1">
      {modes.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          className={`p-2 rounded-md transition-colors ${
            mode === value ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'
          }`}
          title={value}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
