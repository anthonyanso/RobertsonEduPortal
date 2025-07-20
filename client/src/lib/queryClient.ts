import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    if (res.status === 503) {
      // Maintenance mode - trigger redirect to maintenance page
      try {
        const response = JSON.parse(text);
        if (response.maintenanceMode) {
          window.location.hash = 'maintenance';
          return; // Don't throw error, just redirect
        }
      } catch (e) {
        // If we can't parse JSON, still redirect on 503
        window.location.hash = 'maintenance';
        return;
      }
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Handle maintenance mode
    if (res.status === 503) {
      const responseText = await res.text();
      try {
        const response = JSON.parse(responseText);
        if (response.maintenanceMode) {
          window.location.hash = 'maintenance';
          return null; // Return null instead of throwing error
        }
      } catch (e) {
        // If we can't parse JSON, still redirect on 503
        window.location.hash = 'maintenance';
        return null;
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
