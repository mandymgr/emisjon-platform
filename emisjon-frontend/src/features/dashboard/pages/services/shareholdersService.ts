// Mock service for shareholders data
import type { Shareholder } from '@/types/trading';

// Re-export the type for convenience
export type { Shareholder };

// Mock data
const mockShareholders: Shareholder[] = [
  {
    id: '1',
    name: 'Kari Nordmann',
    email: 'kari.nordmann@example.com',
    phone: '+47 123 45 678',
    sharesOwned: 15000,
    totalShares: 15000,
    availableShares: 15000,
    lockedShares: 0,
    sharesLockedForOrders: 0,
    sharesAvailable: 15000,
    ownershipPercentage: 15.0,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Ola Hansen',
    email: 'ola.hansen@example.com',
    phone: '+47 987 65 432',
    sharesOwned: 25000,
    totalShares: 25000,
    availableShares: 25000,
    lockedShares: 0,
    sharesLockedForOrders: 0,
    sharesAvailable: 25000,
    ownershipPercentage: 25.0,
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Anna Larsen',
    email: 'anna.larsen@example.com',
    phone: '+47 555 12 345',
    sharesOwned: 8000,
    totalShares: 8000,
    availableShares: 8000,
    lockedShares: 0,
    sharesLockedForOrders: 0,
    sharesAvailable: 8000,
    ownershipPercentage: 8.0,
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '4',
    name: 'Per Andersen',
    email: 'per.andersen@example.com',
    phone: '+47 777 88 999',
    sharesOwned: 12000,
    totalShares: 12000,
    availableShares: 12000,
    lockedShares: 0,
    sharesLockedForOrders: 0,
    sharesAvailable: 12000,
    ownershipPercentage: 12.0,
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2024-04-05T00:00:00Z'
  }
];

export const getAllShareholders = async (): Promise<Shareholder[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...mockShareholders];
};

export const getShareholderById = async (id: string): Promise<Shareholder | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockShareholders.find(shareholder => shareholder.id === id) || null;
};

export const createShareholder = async (shareholderData: Omit<Shareholder, 'id'>): Promise<Shareholder> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newShareholder: Shareholder = {
    ...shareholderData,
    id: (mockShareholders.length + 1).toString()
  };
  mockShareholders.push(newShareholder);
  return newShareholder;
};

export const updateShareholder = async (id: string, shareholderData: Partial<Shareholder>): Promise<Shareholder | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = mockShareholders.findIndex(shareholder => shareholder.id === id);
  if (index === -1) return null;
  
  mockShareholders[index] = { ...mockShareholders[index], ...shareholderData };
  return mockShareholders[index];
};

export const deleteShareholder = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const index = mockShareholders.findIndex(shareholder => shareholder.id === id);
  if (index === -1) return false;
  
  mockShareholders.splice(index, 1);
  return true;
};