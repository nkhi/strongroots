// Utility to wrap fetch calls with automatic error reporting
// This can be used as a drop-in replacement for fetch in API files

type ErrorReporter = (statusCode: number, route: string) => void;

let globalErrorReporter: ErrorReporter | null = null;

export function setGlobalErrorReporter(reporter: ErrorReporter) {
  globalErrorReporter = reporter;
}

export function clearGlobalErrorReporter() {
  globalErrorReporter = null;
}

/**
 * Wraps a fetch call to automatically report errors via the global error handler
 * @param url - The URL to fetch from
 * @param options - Standard fetch options
 * @returns The fetch response
 * @throws The original error after reporting
 */
export async function fetchWithErrorReporting(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok && globalErrorReporter) {
    // Extract route from URL (remove base URL and query params)
    const urlObj = new URL(url);
    const route = urlObj.pathname;
    globalErrorReporter(response.status, route);
  }
  
  return response;
}

/**
 * Helper to extract route for error display
 */
export function extractRoute(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // If URL parsing fails, return the original
    return url;
  }
}
