import { prisma } from '../prisma/client';

export async function listUsers(filters: { department?: string; isActive?: string; search?: string }, page: number, limit: number) {
  const where: any = {};
  if (filters.department) where.department = filters.department;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  const total = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    select: { id: true, email: true, name: true, designation: true, department: true, profilePhoto: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { name: 'asc' },
  });
  return { users, total };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, designation: true, department: true, profilePhoto: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
}

export async function updateUser(id: string, data: { name?: string; designation?: string; department?: string; role?: 'admin' | 'member'; isActive?: boolean }) {
  return prisma.user.update({ where: { id }, data });
}

export async function deactivateUser(id: string) {
  return prisma.user.update({ where: { id }, data: { isActive: false } });
}

export async function activateUser(id: string) {
  return prisma.user.update({ where: { id }, data: { isActive: true } });
}

export async function hardDeleteUser(id: string) {
  // Delete all related task assignments first
  await prisma.taskAssignment.deleteMany({ where: { userId: id } });
  // Delete tasks created by this user
  await prisma.task.deleteMany({ where: { createdBy: id } });
  // Delete projects created by this user
  await prisma.project.deleteMany({ where: { createdBy: id } });
  // Delete the user
  return prisma.user.delete({ where: { id } });
}

export async function uploadUserProfile(userId: string, filePath: string) {
  return prisma.user.update({ where: { id: userId }, data: { profilePhoto: filePath } });
}
