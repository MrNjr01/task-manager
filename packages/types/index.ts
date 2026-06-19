export type UserRole = 'admin' | 'member';
export type ProjectStatus = 'active' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskDepType = 'none' | 'sequential' | 'parallel';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
  name: string;
  designation: string;
  department: string;
  profilePhoto: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate: string;
  depType: TaskDepType;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
}

export interface TaskWithAssignees extends Task {
  assignees: { user: User; assignedByUser: User }[];
  subtasks?: TaskWithAssignees[];
}

export interface ProjectWithSummary extends Project {
  taskCount: number;
  completedCount: number;
  creator: Pick<User, 'id' | 'name' | 'email'>;
}

export interface MyKpiData {
  pending: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export interface DelegatedPersonKpi {
  user: Pick<User, 'id' | 'name' | 'email' | 'profilePhoto'>;
  totalAssigned: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface DelegatedKpiData {
  persons: DelegatedPersonKpi[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

export interface ApiError {
  error: { code: string; message: string };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  designation: string;
  department: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  designation?: string;
  department?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId?: string;
  parentTaskId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate: string;
  dueDate: string;
  depType?: TaskDepType;
  orderIndex?: number;
  assigneeIds: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  depType?: TaskDepType;
  orderIndex?: number;
}

export interface AssignTaskDto {
  userIds: string[];
}
