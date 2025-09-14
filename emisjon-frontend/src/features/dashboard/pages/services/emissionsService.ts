// Mock service for emissions data - matches the real Emission interface
export interface Emission {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  newSharesOffered: number;
  pricePerShare: number;
  totalValue?: number;
  status: 'PREVIEW' | 'ACTIVE' | 'COMPLETED' | 'FINALIZED' | 'DRAFT' | 'CLOSED' | 'FUNDED' | 'CANCELLED';
  sharesBefore?: number;
  sharesAfter?: number;
  isPreview?: boolean;
  presentationFileUrl?: string;
  finalizedAt?: string | null;
  totalSharesSubscribed?: number;
  createdAt?: string;
}

// Mock data
const mockEmissions: Emission[] = [
  {
    id: '1',
    title: 'Grønn Energi AS - Serie A',
    description: 'Investering i fornybar energi og solcelleteknologi for framtiden',
    status: 'ACTIVE',
    newSharesOffered: 100000,
    pricePerShare: 150,
    totalValue: 15000000,
    totalSharesSubscribed: 23400,
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    sharesBefore: 500000,
    sharesAfter: 600000,
    createdAt: '2024-07-20T00:00:00Z'
  },
  {
    id: '2',
    title: 'TechNor Innovation - Vekstkapital',
    description: 'Norsk teknologi-startup innen AI og maskinlæring',
    status: 'ACTIVE',
    newSharesOffered: 50000,
    pricePerShare: 300,
    totalValue: 15000000,
    totalSharesSubscribed: 15600,
    startDate: '2024-07-15T00:00:00Z',
    endDate: '2024-11-15T23:59:59Z',
    sharesBefore: 200000,
    sharesAfter: 250000,
    createdAt: '2024-07-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'MedTech Solutions - Ekspansjon',
    description: 'Medisinsk teknologi for bedre helsevesen',
    status: 'COMPLETED',
    newSharesOffered: 75000,
    pricePerShare: 200,
    totalValue: 15000000,
    totalSharesSubscribed: 75000,
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    sharesBefore: 300000,
    sharesAfter: 375000,
    finalizedAt: '2024-08-31T12:00:00Z',
    createdAt: '2024-02-15T00:00:00Z'
  }
];

export const getAllEmissions = async (): Promise<Emission[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  return [...mockEmissions];
};

export const getEmissionById = async (id: string): Promise<Emission | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockEmissions.find(emission => emission.id === id) || null;
};

export const createEmission = async (emissionData: Omit<Emission, 'id'>): Promise<Emission> => {
  await new Promise(resolve => setTimeout(resolve, 900));
  const newEmission: Emission = {
    ...emissionData,
    id: (mockEmissions.length + 1).toString(),
    createdAt: new Date().toISOString()
  };
  mockEmissions.push(newEmission);
  return newEmission;
};

export const updateEmission = async (id: string, emissionData: Partial<Emission>): Promise<Emission | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const index = mockEmissions.findIndex(emission => emission.id === id);
  if (index === -1) return null;
  
  mockEmissions[index] = { ...mockEmissions[index], ...emissionData };
  return mockEmissions[index];
};

export const deleteEmission = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const index = mockEmissions.findIndex(emission => emission.id === id);
  if (index === -1) return false;
  
  mockEmissions.splice(index, 1);
  return true;
};