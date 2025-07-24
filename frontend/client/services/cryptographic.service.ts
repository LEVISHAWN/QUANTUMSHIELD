import { api } from '../lib/api';

export interface CryptoRequest {
  data: string;
  algorithm: string;
}

export interface CryptoResponse {
  result: string;
  timestamp: string;
}

export const cryptographicService = {
  encrypt: async (data: CryptoRequest) => {
    const response = await api.post<CryptoResponse>('/cryptographic/encrypt', data);
    return response.data;
  },

  decrypt: async (data: CryptoRequest) => {
    const response = await api.post<CryptoResponse>('/cryptographic/decrypt', data);
    return response.data;
  },

  validateKey: async (key: string) => {
    const response = await api.post<{ valid: boolean }>('/cryptographic/validate-key', { key });
    return response.data;
  }
};
