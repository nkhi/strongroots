/**
 * TanStack Query Client
 *
 * Global QueryClient instance with default options.
 * See: https://tanstack.com/query/latest/docs/reference/QueryClient
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,  // 5 min - data considered fresh
            gcTime: 1000 * 60 * 30,    // 30 min - garbage collection
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});
