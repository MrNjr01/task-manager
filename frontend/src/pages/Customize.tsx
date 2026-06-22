import { useState } from 'react';
import { Palette, Image, Type, Save } from 'lucide-react';

export default function Customize() {
  const [logo, setLogo] = useState('CheckSquare');
  const [appName, setAppName] = useState('Simple Task Manager');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('appConfig', JSON.stringify({ logo, appName, primaryColor }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customize</h1>
        <p className="text-muted-foreground">Configure appearance and branding</p>
      </div>

      <div className="space-y-4">
        {/* App Name */}
        <div className="border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">App Name</h2>
          </div>
          <input
            type="text"
            value={appName}
            onChange={e => setAppName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring outline-none"
            placeholder="Simple Task Manager"
          />
        </div>

        {/* Logo Icon */}
        <div className="border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Logo Icon</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {['CheckSquare', 'ClipboardList', 'Target', 'Layers', 'Zap', 'Star', 'Heart', 'Shield'].map(icon => (
              <button
                key={icon}
                onClick={() => setLogo(icon)}
                className={`p-3 border rounded-lg text-center text-sm transition-all ${
                  logo === icon ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-accent'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div className="border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Primary Color</h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg bg-background font-mono text-sm"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-2">
          {saved && <span className="text-sm text-green-600">Settings saved!</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
