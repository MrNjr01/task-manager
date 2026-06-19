import { useState } from 'react';

interface ProjectFormProps {
  project?: { id: string; name: string; description: string | null };
  onSave: (data: { name: string; description?: string }) => void;
  onClose: () => void;
}

export function ProjectForm({ project, onSave, onClose }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description: description || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">{project ? 'Edit Project' : 'Create Project'}</h2>
        <div>
          <label className="text-sm font-medium">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md bg-background" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save</button>
        </div>
      </form>
    </div>
  );
}
