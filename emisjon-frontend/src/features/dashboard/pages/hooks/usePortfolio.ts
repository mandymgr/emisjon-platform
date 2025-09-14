// Mock hook for portfolio data
export interface Portfolio {
  totalValue: number;
  totalShares: number;
  portfolioItems: Array<{
    id: string;
    name: string;
    shares: number;
    value: number;
    performance: number;
  }>;
}

export const usePortfolio = () => {
  return {
    portfolio: {
      totalValue: 125000,
      totalShares: 1250,
      portfolioItems: [
        {
          id: '1',
          name: 'Grønn Energi AS',
          shares: 500,
          value: 75000,
          performance: 12.5
        },
        {
          id: '2',
          name: 'TechNor Innovation',
          shares: 250,
          value: 50000,
          performance: -3.2
        }
      ]
    } as Portfolio,
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};