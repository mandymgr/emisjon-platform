// Mock service for users data
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  level: number;
  createdAt: string;
  lastLogin?: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Jon Doe',
    email: 'jon.doe@example.com',
    role: 'ADMIN',
    level: 4,
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-09-14T08:15:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'USER',
    level: 2,
    createdAt: '2024-02-20T14:20:00Z',
    lastLogin: '2024-09-13T16:45:00Z'
  },
  {
    id: '3',
    name: 'Erik Hansen',
    email: 'erik.hansen@example.com',
    role: 'USER',
    level: 3,
    createdAt: '2024-03-10T09:00:00Z',
    lastLogin: '2024-09-14T07:30:00Z'
  }
];

export const getAllUsers = async (): Promise<User[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockUsers];
};

export const getUserById = async (id: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockUsers.find(user => user.id === id) || null;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newUser: User = {
    ...userData,
    id: (mockUsers.length + 1).toString(),
    createdAt: new Date().toISOString()
  };
  mockUsers.push(newUser);
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = mockUsers.findIndex(user => user.id === id);
  if (index === -1) return null;
  
  mockUsers[index] = { ...mockUsers[index], ...userData };
  return mockUsers[index];
};

export const deleteUser = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const index = mockUsers.findIndex(user => user.id === id);
  if (index === -1) return false;
  
  mockUsers.splice(index, 1);
  return true;
};