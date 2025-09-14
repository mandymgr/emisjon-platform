import { useMemo } from 'react';
import moment from 'moment';

moment.locale('nb-no');

export const useNorwegianDate = () => {
  return useMemo(() => {
    const formatDate = (date: string | Date | undefined | null): string => {
      if (!date) return '';
      return moment(date).format('DD.MM.YYYY');
    };

    const formatDateTime = (date: string | Date | undefined | null): string => {
      if (!date) return '';
      return moment(date).format('DD.MM.YYYY HH:mm');
    };

    const formatLongDate = (date: string | Date | undefined | null): string => {
      if (!date) return '';
      return moment(date).format('D. MMMM YYYY');
    };

    const formatRelativeTime = (date: string | Date | undefined | null): string => {
      if (!date) return '';
      return moment(date).fromNow();
    };

    return {
      formatDate,
      formatDateTime,
      formatLongDate,
      formatRelativeTime,
    };
  }, []);
};

export const useNorwegianNumber = () => {
  return useMemo(() => {
    const formatNumber = (num: number | string | undefined | null, decimals: number = 0): string => {
      if (num === null || num === undefined || num === '') return '';
      
      const number = typeof num === 'string' ? parseFloat(num) : num;
      if (isNaN(number)) return '';

      return new Intl.NumberFormat('nb-NO', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number);
    };

    const formatCurrency = (amount: number | string | undefined | null): string => {
      if (amount === null || amount === undefined || amount === '') return '';
      
      const number = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(number)) return '';

      // Format number with Norwegian locale, only show decimals if needed
      return new Intl.NumberFormat('nb-NO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number);
    };

    const formatPercent = (value: number | string | undefined | null, decimals: number = 2): string => {
      if (value === null || value === undefined || value === '') return '';
      
      const number = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(number)) return '';

      return new Intl.NumberFormat('nb-NO', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number / 100);
    };

    const parseNorwegianNumber = (str: string): number | null => {
      if (!str) return null;
      
      const normalized = str
        .replace(/\s/g, '')
        .replace(',', '.');
      
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? null : parsed;
    };

    return {
      formatNumber,
      formatCurrency,
      formatPercent,
      parseNorwegianNumber,
    };
  }, []);
};