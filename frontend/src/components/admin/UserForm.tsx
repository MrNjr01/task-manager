import { useState } from 'react';

interface UserFormProps {
  user?: { id: string; name: string; designation: string; department: string; role: string; isActive: boolean } | null;
  onCreate?: (data: any) => void;
  onUpdate?: (data: any) => void;
  onClose: () => void;
  mode: 'create' | 'edit';
}

export function UserForm({ user, onCreate, onUpdate, onClose, mode }: UserFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.id ? '' : '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [role, setRole] = useState(user?.role || 'member');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
      try {
        await onCreate!({ email, password, name, designation, department, role });
        onClose();
      } catch (err: any) { setError(err.message); }
    } else {
      try {
        await onUpdate!({ name, designation, department, role });
        onClose();
      } catch (err: any) { setError(err.message); }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">{mode === 'create' ? 'Create User' : 'Edit User'}</h2>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {mode === 'create' && (
          <>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
            </div>
          </>
        )}
        <div>
          <label className="text-sm font-medium">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium">Designation *</label>
          <input value={designation} onChange={e => setDesignation(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium">Department *</label>
          <input value={department} onChange={e => setDepartment(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">{mode === 'create' ? 'Create' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
