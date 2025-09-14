import { useState } from 'react';

export function useErrorAlert() {
  const [error, setError] = useState<{
    open: boolean;
    title?: string;
    message: string;
  }>({
    open: false,
    message: '',
  });

  const showError = (message: string, title?: string) => {
    setError({
      open: true,
      title,
      message,
    });
  };

  const hideError = () => {
    setError(prev => ({ ...prev, open: false }));
  };

  return {
    error,
    showError,
    hideError,
  };
}