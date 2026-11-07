import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import * as apiClientModule from '@/lib/api-client';

describe('ChallengesPage (Coding Arena Catalog)', () => {
  it('renders catalog header and challenge cards correctly', async () => {
    const mockChallenges = {
      items: [
        {
          id: 'ch-1',
          title: 'Sliding Window Rate Limiter',
          slug: 'sliding-window-rate-limiter',
          difficulty: 'medium',
          category: 'system_design',
          description: 'Design an in-memory Sliding Window Rate Limiter.',
          supported_languages: ['python', 'typescript'],
          tags: [{ id: 't1', name: 'concurrency', slug: 'concurrency' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          acceptance_rate: 85.0,
          total_submissions: 20,
          user_status: 'unsolved',
          is_bookmarked: false,
        },
      ],
      total: 1,
      page: 1,
      page_size: 10,
      total_pages: 1,
    };

    vi.spyOn(apiClientModule, 'apiClient').mockImplementation(async (url: string) => {
      if (url.startsWith('/challenges')) {
        return mockChallenges as any;
      }
      if (url.startsWith('/auth/me')) {
        return { user: null } as any;
      }
      return {} as any;
    });

    render(
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ChallengesPage />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Coding Arena Catalog')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Sliding Window Rate Limiter')).toBeInTheDocument();
      expect(screen.getByText('85% acceptance')).toBeInTheDocument();
      expect(screen.getByText('#concurrency')).toBeInTheDocument();
    });
  });

  it('renders empty state when no challenges match', async () => {
    vi.spyOn(apiClientModule, 'apiClient').mockImplementation(async (url: string) => {
      if (url.startsWith('/challenges')) {
        return { items: [], total: 0, page: 1, page_size: 10, total_pages: 0 } as any;
      }
      return {} as any;
    });

    render(
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ChallengesPage />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No challenges match your criteria')).toBeInTheDocument();
      expect(screen.getByText('Reset All Filters')).toBeInTheDocument();
    });
  });
});
