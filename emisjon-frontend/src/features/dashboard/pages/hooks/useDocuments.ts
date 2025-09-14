// Mock hook for documents data
export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'OTHER';
  size: string;
  uploadDate: string;
  category: string;
}

export const useDocuments = () => {
  return {
    documents: [
      {
        id: '1',
        name: 'Årsrapport 2024.pdf',
        type: 'PDF' as const,
        size: '2.4 MB',
        uploadDate: '2024-09-10T10:30:00Z',
        category: 'Rapporter'
      },
      {
        id: '2',
        name: 'Emisjonsdokument Q3.pdf',
        type: 'PDF' as const,
        size: '1.8 MB', 
        uploadDate: '2024-09-08T14:20:00Z',
        category: 'Emisjoner'
      },
      {
        id: '3',
        name: 'Aksjonærliste.xls',
        type: 'XLS' as const,
        size: '124 KB',
        uploadDate: '2024-09-05T09:15:00Z',
        category: 'Administrative'
      }
    ] as Document[],
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};