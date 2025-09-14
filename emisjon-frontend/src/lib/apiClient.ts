import axiosInstance from './axios';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';

/**
 * Enhanced API client with proper TypeScript typing and error handling
 * Built on top of the existing axios instance with Norwegian error messages
 */

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

/**
 * Format error messages for Norwegian users
 */
function formatErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  switch (error.response?.status) {
    case 400:
      return 'Ugyldig forespørsel. Kontroller dataene og prøv igjen.';
    case 401:
      return 'Du må logge inn for å utføre denne handlingen.';
    case 403:
      return 'Du har ikke tilgang til denne ressursen.';
    case 404:
      return 'Ressursen ble ikke funnet.';
    case 409:
      return 'Konflikt. Ressursen eksisterer allerede.';
    case 422:
      return 'Valideringsfeil. Kontroller dataene og prøv igjen.';
    case 429:
      return 'For mange forespørsler. Vent et øyeblikk og prøv igjen.';
    case 500:
      return 'Serverfeil. Prøv igjen senere.';
    case 502:
      return 'Tjenesten er ikke tilgjengelig. Prøv igjen senere.';
    case 503:
      return 'Tjenesten er midlertidig utilgjengelig. Prøv igjen senere.';
    default:
      if (!error.response) {
        return 'Nettverksfeil. Kontroller internettforbindelsen og prøv igjen.';
      }
      return 'Noe gikk galt. Prøv igjen senere.';
  }
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: any): never {
  const apiError: ApiError = {
    message: formatErrorMessage(error),
    status: error.response?.status,
    code: error.response?.data?.code || error.code,
    details: error.response?.data || error.message,
  };

  throw new ApiClientError(apiError);
}

/**
 * Generic GET request
 */
export async function get<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Generic POST request
 */
export async function post<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Generic PUT request
 */
export async function put<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Generic PATCH request
 */
export async function patch<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Generic DELETE request
 */
export async function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * API client object with all methods
 */
export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,

  // Convenience methods for common patterns
  async fetchList<T>(endpoint: string, params?: Record<string, any>): Promise<T[]> {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
    return get<T[]>(url);
  },

  async fetchOne<T>(endpoint: string, id: string | number): Promise<T> {
    return get<T>(`${endpoint}/${id}`);
  },

  async create<T, D = unknown>(endpoint: string, data: D): Promise<T> {
    return post<T, D>(endpoint, data);
  },

  async update<T, D = unknown>(endpoint: string, id: string | number, data: D): Promise<T> {
    return put<T, D>(`${endpoint}/${id}`, data);
  },

  async partialUpdate<T, D = unknown>(endpoint: string, id: string | number, data: D): Promise<T> {
    return patch<T, D>(`${endpoint}/${id}`, data);
  },

  async remove<T = unknown>(endpoint: string, id: string | number): Promise<T> {
    return del<T>(`${endpoint}/${id}`);
  }
};

// Export default for backward compatibility
export default apiClient;