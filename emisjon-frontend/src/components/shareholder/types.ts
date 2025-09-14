export interface Shareholder {
  id: string;
  name: string;
  email: string;
  shares: number;
  percentage: number;
  value?: number;
  change?: number;
  joinedAt?: string;
  userId?: string;
}

export interface CreateShareholderDTO {
  name: string;
  email: string;
  phone?: string;
  shares: number;
  userId?: string;
}

export interface UpdateShareholderDTO {
  name?: string;
  email?: string;
  phone?: string;
  shares?: number;
}