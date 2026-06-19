import { prisma } from '../prisma/client';

export async function getMyKpis(userId: string) {
  const now = new Date();

  const byStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { assignments: { some: { userId } } },
    _count: { status: true },
  });

  const overdue = await prisma.task.count({
    where: { assignments: { some: { userId } }, status: { not: 'done' }, dueDate: { lt: now } },
  });

  const redelegated = await prisma.task.count({
    where: {
      assignments: {
        some: {
          userId: { not: userId },
          assignedBy: userId,
        },
      },
    },
  });

  const result: Record<string, number> = { pending: 0, inProgress: 0, done: 0, overdue, redelegated };
  byStatus.forEach(t => {
    if (t.status === 'todo') result.pending = t._count.status;
    if (t.status === 'in_progress' || t.status === 'review') result.inProgress = t._count.status;
    if (t.status === 'done') result.done = t._count.status;
  });

  return result as { pending: number; inProgress: number; done: number; overdue: number; redelegated: number };
}

export async function getDelegatedKpis(userId: string) {
  const now = new Date();
  const assignments = await prisma.taskAssignment.findMany({
    where: { assignedBy: userId },
    include: {
      user: { select: { id: true, name: true, email: true, profilePhoto: true } },
      task: { select: { status: true, dueDate: true, id: true } },
    },
  });

  const personMap = new Map<string, { user: any; totalAssigned: number; completed: number; pending: number; inProgress: number; overdue: number }>();

  for (const a of assignments) {
    if (a.userId === userId) continue;
    const key = a.userId;
    if (!personMap.has(key)) {
      personMap.set(key, { user: a.user, totalAssigned: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 });
    }
    const p = personMap.get(key)!;
    p.totalAssigned++;
    if (a.task.status === 'done') p.completed++;
    else if (a.task.status === 'in_progress' || a.task.status === 'review') p.inProgress++;
    else if (a.task.dueDate < now) p.overdue++;
    else p.pending++;
  }

  return { persons: Array.from(personMap.values()) };
}
