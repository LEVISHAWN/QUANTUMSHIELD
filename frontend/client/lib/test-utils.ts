import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Reset all mocks before each test
beforeEach(() => {
  mockFetch.mockReset();
});

// Helper to mock successful API responses
export const mockApiSuccess = (data: any) => {
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

// Helper to mock API errors
export const mockApiError = (status: number, message: string) => {
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ message }),
    })
  );
};
