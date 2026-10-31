// AeroWard Frontend API Client with no synthetic fallback dataset.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[AeroWard Client] Fetch error for ${url}:`, err);
    return null;
  }
}

export function getFallbackData<T>(_endpoint: string): T | null {
  return null;
}
