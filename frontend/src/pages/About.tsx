export default function About() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">About Simple Task Manager</h1>
      <div className="border rounded-lg p-6 space-y-4">
        <p className="text-muted-foreground">
          Simple Task Manager is a project and task management tool designed for teams of any size.
          It helps you organize work, track progress, and collaborate effectively.
        </p>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Key Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Task Management</strong> — Create, assign, and track tasks with multiple views (List, Kanban, Tree)</li>
            <li>• <strong>Project Organization</strong> — Group tasks into projects with parallel and sequential workflows</li>
            <li>• <strong>Subtasks</strong> — Break down complex tasks into manageable subtasks</li>
            <li>• <strong>Delegation</strong> — Assign tasks to team members and track their progress</li>
            <li>• <strong>Redelegation</strong> — Reassign tasks when workloads change</li>
            <li>• <strong>Dashboard</strong> — Overview of your tasks and delegated work</li>
            <li>• <strong>Calendar View</strong> — Visual timeline of all tasks</li>
            <li>• <strong>Dark/Light Mode</strong> — Choose your preferred theme</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Version</h2>
          <p className="text-sm text-muted-foreground">1.0.0</p>
        </div>
      </div>
    </div>
  );
}
