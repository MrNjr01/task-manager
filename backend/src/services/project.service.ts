import { prisma } from '../prisma/client';

export async function listProjects(userId: string, role: string, page: number, limit: number) {
  const where: any = role === 'admin' ? {} : { createdBy: userId };
  const total = await prisma.project.count({ where });
  const projects = await prisma.project.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  const result = projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdBy: p.createdBy,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    taskCount: p._count.tasks,
    completedCount: 0,
    creator: p.creator,
  }));
  return { projects: result, total };
}

export async function getProject(id: string, userId: string, role: string) {
  const project = await prisma.project.findFirst({
    where: role === 'admin' ? { id } : { id, createdBy: userId },
    include: { creator: { select: { id: true, name: true, email: true } } },
  });
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdBy: project.createdBy,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    creator: project.creator,
  };
}

export async function createProject(data: { name: string; description?: string }, createdById: string) {
  return prisma.project.create({ data: { ...data, createdBy: createdById } });
}

export async function updateProject(id: string, data: { name?: string; description?: string; status?: 'active' | 'archived' }) {
  return prisma.project.update({ where: { id }, data });
}

export async function archiveProject(id: string) {
  return prisma.project.update({ where: { id }, data: { status: 'archived' } });
}
