export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Normalizes a URL by removing leading and trailing slashes.
 * @param url The URL string to normalize.
 * @returns The normalized URL string.
 */
function normalizeUrl(url: string): string {
  // Remove trailing slashes
  let normalized = url.endsWith('/') ? url.slice(0, -1) : url;
  // Remove leading slashes
  normalized = normalized.startsWith('/') ? normalized.slice(1) : normalized;
  return normalized;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get the authentication token from local storage
  const authToken = localStorage.getItem('authToken');

  // Explicitly type the headers object as a Record<string, string>
  // to allow for dynamic key assignment like "Authorization"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // If a token exists, add it to the Authorization header
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // Use the normalizeUrl function to prevent the double slash issue
  const baseUrl = normalizeUrl(API_BASE_URL);
  const normalizedEndpoint = normalizeUrl(endpoint);

  const res = await fetch(`${baseUrl}/${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<T>;
}
