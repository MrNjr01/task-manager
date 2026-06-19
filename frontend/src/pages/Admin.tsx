import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { AdminUserTable } from '../components/admin/UserTable';
import { UserForm } from '../components/admin/UserForm';
import { PhotoUpload } from '../components/admin/PhotoUpload';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  designation: string;
  department: string;
  profilePhoto: string | null;
  role: 'admin' | 'member';
  isActive: boolean;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [photoUserId, setPhotoUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    api.get<{ users: User[] }>('/api/users').then(r => {
      setUsers(r.data.users);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = async (data: any) => {
    await api.post('/api/auth/register', data);
    fetchUsers();
  };

  const updateUser = async (data: any) => {
    if (!editingUser) return;
    await api.put(`/api/users/${editingUser.id}`, data);
    fetchUsers();
    setEditingUser(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Deactivate this user?')) return;
    await api.delete(`/api/users/${userId}`);
    fetchUsers();
  };

  const uploadPhoto = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch('/api/users/' + userId + '/photo', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">{users.length} users</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading...</div>}

      {!loading && <AdminUserTable users={users} onEdit={u => setEditingUser(u)} onDelete={deleteUser} onPhotoUpload={id => setPhotoUserId(id)} />}

      {showCreate && <UserForm mode="create" onCreate={createUser} onClose={() => setShowCreate(false)} />}
      {editingUser && <UserForm mode="edit" user={editingUser} onUpdate={updateUser} onClose={() => setEditingUser(null)} />}
      {photoUserId && <PhotoUpload userId={photoUserId} onUpload={uploadPhoto} onClose={() => setPhotoUserId(null)} />}
    </div>
  );
}
