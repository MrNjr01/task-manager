import { prisma } from '../prisma/client';

function serializeTask(task: any) {
  return {
    ...task,
    startDate: task.startDate.toISOString(),
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignees: task.assignments ? task.assignments.map((a: any) => ({
      user: a.user,
      assignedByUser: a.assignedByUser,
    })) : [],
  };
}

export async function listTasks(userId: string, role: string, filters: any, page: number, limit: number) {
  const scope = filters.scope || 'my';
  let where: any = {};

  if (scope === 'my') {
    where = role === 'admin' ? {} : { assignments: { some: { userId } } };
  } else if (scope === 'delegated') {
    where = { assignments: { some: { assignedBy: userId, userId: { not: userId } } } };
  } else if (scope === 'redelegated') {
    // Tasks that are redelegations of tasks assigned to this user
    // First find all task IDs assigned to this user, then find tasks referencing them
    const myTaskIds = await prisma.taskAssignment.findMany({
      where: { userId },
      select: { taskId: true },
    });
    const myIds = myTaskIds.map(a => a.taskId);
    where = { referenceTaskId: { in: myIds } };
  }

  if (filters.project) where.projectId = filters.project;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.from || filters.to) {
    where.dueDate = {};
    if (filters.from) where.dueDate.gte = new Date(filters.from);
    if (filters.to) where.dueDate.lte = new Date(filters.to);
  }

  const total = await prisma.task.count({ where });
  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true, profilePhoto: true } }, assignedByUser: { select: { id: true, name: true } } } },
      project: { select: { id: true, name: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
  });
  return { tasks: tasks.map(serializeTask), total };
}

export async function getTask(id: string, userId: string, role: string) {
  const task = await prisma.task.findFirst({
    where: role === 'admin' ? { id } : { id, assignments: { some: { userId } } },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true, profilePhoto: true } }, assignedByUser: { select: { id: true, name: true } } } },
      project: { select: { id: true, name: true } },
      subtasks: true,
    },
  });
  return task ? serializeTask(task) : null;
}

export async function createTask(data: any, createdById: string) {
  const { assigneeIds, ...taskData } = data;
  const task = await prisma.task.create({
    data: {
      ...taskData,
      createdBy: createdById,
      assignments: { createMany: { data: assigneeIds.map((uid: string) => ({ userId: uid, assignedBy: createdById })) } },
    },
    include: { assignments: { include: { user: { select: { id: true, name: true } }, assignedByUser: { select: { id: true, name: true } } } } },
  });
  return serializeTask(task);
}

export async function updateTask(id: string, data: any) {
  const task = await prisma.task.update({ where: { id }, data });
  return serializeTask({ ...task, assignments: [] });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

export async function addAssignees(taskId: string, userIds: string[], assignedBy: string) {
  return prisma.taskAssignment.createMany({
    data: userIds.map(uid => ({ taskId, userId: uid, assignedBy })),
    skipDuplicates: true,
  });
}

export async function removeAssignee(taskId: string, userId: string) {
  const count = await prisma.taskAssignment.count({ where: { taskId } });
  if (count <= 1) throw new Error('Cannot remove last assignee');
  return prisma.taskAssignment.deleteMany({ where: { taskId, userId } });
}

export async function redelegateTask(taskId: string, fromUserId: string, toUserId: string, reassignedBy: string) {
  // Get original task
  const originalTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!originalTask) throw new Error('Task not found');

  // Create NEW task as a redelegation of the original
  const newTask = await prisma.task.create({
    data: {
      title: originalTask.title,
      description: originalTask.description,
      status: 'todo',
      priority: originalTask.priority,
      startDate: originalTask.startDate,
      dueDate: originalTask.dueDate,
      projectId: originalTask.projectId,
      referenceTaskId: taskId, // links back to original
      createdBy: reassignedBy,
      assignments: {
        create: {
          userId: toUserId,
          assignedBy: fromUserId, // the person who redelegated
        },
      },
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true } }, assignedByUser: { select: { id: true, name: true } } } },
    },
  });

  return serializeTask(newTask);
}

export async function updateTaskStatus(id: string, status: string) {
  const task = await prisma.task.update({ where: { id }, data: { status } });
  return serializeTask({ ...task, assignments: [] });
}

export async function getSubtasks(taskId: string, userId: string, role: string) {
  const tasks = await prisma.task.findMany({
    where: {
      parentTaskId: taskId,
      ...(role === 'admin' ? {} : { assignments: { some: { userId } } }),
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { orderIndex: 'asc' },
  });
  return tasks.map(t => serializeTask({ ...t, assignments: t.assignments || [] }));
}
