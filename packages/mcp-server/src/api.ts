export interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  token: string,
  options?: RequestOptions
): Promise<T> {
  const url = `${baseUrl}${path}`;
  const method = options?.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchOptions: RequestInit = { method, headers };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `SlideМaker API error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return (await response.json()) as T;
}
