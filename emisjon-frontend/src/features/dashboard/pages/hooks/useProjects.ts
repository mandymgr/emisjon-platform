// Mock hook for projects data
export interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
  progress: number;
  description: string;
}

export const useProjects = () => {
  return {
    projects: [
      {
        id: '1',
        name: 'Q4 Emisjonsstrategi',
        status: 'ACTIVE' as const,
        progress: 75,
        description: 'Planlegging av fjerde kvartal emisjoner'
      },
      {
        id: '2', 
        name: 'Investor Relations',
        status: 'PENDING' as const,
        progress: 30,
        description: 'Oppgradering av investor kommunikasjon'
      }
    ] as Project[],
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};