// Mock service for shareholders data
export interface Shareholder {
  id: string;
  name: string;
  email: string;
  shareCount: number;
  ownershipPercentage: number;
  shareClass: string;
  registrationDate: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
}

// Mock data
const mockShareholders: Shareholder[] = [
  {
    id: '1',
    name: 'Kari Nordmann',
    email: 'kari.nordmann@example.com',
    shareCount: 15000,
    ownershipPercentage: 15.0,
    shareClass: 'A',
    registrationDate: '2024-01-15T00:00:00Z',
    contactPhone: '+47 123 45 678',
    address: 'Storgata 1, 0001 Oslo',
    isActive: true
  },
  {
    id: '2',
    name: 'Ola Hansen',
    email: 'ola.hansen@example.com',
    shareCount: 25000,
    ownershipPercentage: 25.0,
    shareClass: 'A',
    registrationDate: '2024-02-20T00:00:00Z',
    contactPhone: '+47 987 65 432',
    address: 'Lillestorg 5, 4600 Kristiansand',
    isActive: true
  },
  {
    id: '3',
    name: 'Anna Larsen',
    email: 'anna.larsen@example.com',
    shareCount: 8000,
    ownershipPercentage: 8.0,
    shareClass: 'B',
    registrationDate: '2024-03-10T00:00:00Z',
    contactPhone: '+47 555 12 345',
    address: 'Bergensveien 12, 5003 Bergen',
    isActive: true
  },
  {
    id: '4',
    name: 'Per Andersen',
    email: 'per.andersen@example.com',
    shareCount: 12000,
    ownershipPercentage: 12.0,
    shareClass: 'A',
    registrationDate: '2024-04-05T00:00:00Z',
    contactPhone: '+47 777 88 999',
    address: 'Torget 8, 7010 Trondheim',
    isActive: false
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