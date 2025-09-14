export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  level: number;
  createdAt: string;
  updatedAt: string;
  shareholder?: {
    id: string;
    sharesOwned: number;
  };
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  level?: number;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  level?: number;
}

export type { User as UserType, CreateUserDTO as CreateUserType, UpdateUserDTO as UpdateUserType };