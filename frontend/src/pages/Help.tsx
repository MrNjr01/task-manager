export default function Help() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Help & Documentation</h1>
      <div className="border rounded-lg divide-y">
        <div className="p-6">
          <h2 className="font-semibold mb-2">Getting Started</h2>
          <p className="text-sm text-muted-foreground">
            After logging in, you'll see the Dashboard with an overview of your tasks.
            Use the sidebar to navigate between My Tasks, Delegated, and Redelegated views.
          </p>
        </div>
        <div className="p-6">
          <h2 className="font-semibold mb-2">Creating Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Click "New Task" to create a task. You must assign at least one person (including yourself).
            Set start date, due date, priority, and optionally link to a project.
          </p>
        </div>
        <div className="p-6">
          <h2 className="font-semibold mb-2">Task Actions</h2>
          <p className="text-sm text-muted-foreground">
            Click any task to view details. As the assignee, you can mark tasks as In Progress or Complete.
            You can also redelegate a task to another team member.
          </p>
        </div>
        <div className="p-6">
          <h2 className="font-semibold mb-2">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Create projects to group related tasks. You can set tasks as parallel (independent) or
            sequential (one after another). Only the project creator can edit or archive a project.
          </p>
        </div>
        <div className="p-6">
          <h2 className="font-semibold mb-2">Subtasks</h2>
          <p className="text-sm text-muted-foreground">
            Subtasks help break down complex work. Create them within a parent task to organize
            your workflow. Subtasks must fall within the parent task's timeline.
          </p>
        </div>
        <div className="p-6">
          <h2 className="font-semibold mb-2">Views</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>List</strong> — Table view with all task details</li>
            <li>• <strong>Kanban</strong> — Board view organized by status</li>
            <li>• <strong>Tree</strong> — Hierarchical view showing parent-child relationships</li>
            <li>• <strong>Calendar</strong> — Timeline view of all tasks by date</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
