export const getRoleLevelOptions = (role: 'USER' | 'ADMIN'): number[] => {
  if (role === 'USER') {
    return [1, 2, 3];
  } else {
    return [1, 2];
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};