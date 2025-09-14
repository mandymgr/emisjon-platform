// Mock service for emissions data
export interface Emission {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'CLOSED' | 'PENDING' | 'DRAFT';
  totalShares: number;
  pricePerShare: number;
  totalValue: number;
  subscriptions: number;
  openingDate: string;
  closingDate?: string;
  minimumInvestment: number;
  maximumInvestment?: number;
  category: 'TECH' | 'ENERGY' | 'HEALTHCARE' | 'FINANCE' | 'OTHER';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Mock data
const mockEmissions: Emission[] = [
  {
    id: '1',
    name: 'Grønn Energi AS - Serie A',
    description: 'Investering i fornybar energi og solcelleteknologi for framtiden',
    status: 'ACTIVE',
    totalShares: 100000,
    pricePerShare: 150,
    totalValue: 15000000,
    subscriptions: 234,
    openingDate: '2024-08-01T00:00:00Z',
    closingDate: '2024-12-31T23:59:59Z',
    minimumInvestment: 1000,
    maximumInvestment: 500000,
    category: 'ENERGY',
    riskLevel: 'MEDIUM'
  },
  {
    id: '2',
    name: 'TechNor Innovation - Vekstkapital',
    description: 'Norsk teknologi-startup innen AI og maskinlæring',
    status: 'ACTIVE',
    totalShares: 50000,
    pricePerShare: 300,
    totalValue: 15000000,
    subscriptions: 156,
    openingDate: '2024-07-15T00:00:00Z',
    closingDate: '2024-11-15T23:59:59Z',
    minimumInvestment: 5000,
    maximumInvestment: 1000000,
    category: 'TECH',
    riskLevel: 'HIGH'
  },
  {
    id: '3',
    name: 'MedTech Solutions - Ekspansjon',
    description: 'Medisinsk teknologi for bedre helsevesen',
    status: 'CLOSED',
    totalShares: 75000,
    pricePerShare: 200,
    totalValue: 15000000,
    subscriptions: 289,
    openingDate: '2024-03-01T00:00:00Z',
    closingDate: '2024-08-31T23:59:59Z',
    minimumInvestment: 2000,
    maximumInvestment: 750000,
    category: 'HEALTHCARE',
    riskLevel: 'MEDIUM'
  },
  {
    id: '4',
    name: 'FinanceFlow - Digital Banking',
    description: 'Neste generasjon digital bankløsninger',
    status: 'PENDING',
    totalShares: 80000,
    pricePerShare: 250,
    totalValue: 20000000,
    subscriptions: 0,
    openingDate: '2024-10-01T00:00:00Z',
    closingDate: '2025-03-31T23:59:59Z',
    minimumInvestment: 3000,
    maximumInvestment: 800000,
    category: 'FINANCE',
    riskLevel: 'MEDIUM'
  },
  {
    id: '5',
    name: 'AquaFarm Norge - Bærekraftig oppdrett',
    description: 'Innovativ og miljøvennlig oppdrettsteknologi',
    status: 'DRAFT',
    totalShares: 60000,
    pricePerShare: 180,
    totalValue: 10800000,
    subscriptions: 0,
    openingDate: '2024-11-15T00:00:00Z',
    minimumInvestment: 1500,
    maximumInvestment: 600000,
    category: 'OTHER',
    riskLevel: 'LOW'
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
    id: (mockEmissions.length + 1).toString()
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