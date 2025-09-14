export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  shareholder?: any;
}