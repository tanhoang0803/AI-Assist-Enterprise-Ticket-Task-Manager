export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  role?: UserRole;
}
