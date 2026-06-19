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

interface AdminUserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPhotoUpload: (userId: string) => void;
}

export function AdminUserTable({ users, onEdit, onDelete, onPhotoUpload }: AdminUserTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Designation</th>
            <th className="text-left p-3 font-medium">Department</th>
            <th className="text-left p-3 font-medium">Role</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map(u => (
            <tr key={u.id} className={!u.isActive ? 'opacity-50' : ''}>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {u.profilePhoto ? (
                    <img src={u.profilePhoto} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{u.name.charAt(0)}</div>
                  )}
                  <span className="font-medium">{u.name}</span>
                </div>
              </td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.designation}</td>
              <td className="p-3">{u.department}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onPhotoUpload(u.id)} className="text-xs text-green-600 hover:underline">Photo</button>
                  {u.isActive && <button onClick={() => onDelete(u.id)} className="text-xs text-destructive hover:underline">Deactivate</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
