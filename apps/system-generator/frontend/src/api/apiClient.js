const DEFAULT_API_BASE_URL = "http://localhost:3100/api";
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

const requestInterceptors = [];
const responseInterceptors = [];

let authToken = null;

function getBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  if (!error) {
    return false;
  }

  if (error.name === "AbortError") {
    return false;
  }

  if (typeof error.statusCode === "number") {
    return RETRYABLE_STATUS_CODES.has(error.statusCode);
  }

  return true;
}

function toFriendlyErrorMessage(statusCode, serverMessage) {
  if (serverMessage) {
    return serverMessage;
  }

  if (statusCode === 400) return "Invalid request data. Please review your input and try again.";
  if (statusCode === 401) return "You are not authenticated. Please sign in and retry.";
  if (statusCode === 403) return "You do not have permission to perform this action.";
  if (statusCode === 404) return "The requested item was not found.";
  if (statusCode === 409) return "This update conflicts with current data. Refresh and try again.";
  if (statusCode === 429) return "Too many requests. Please wait a moment and try again.";
  if (statusCode >= 500) return "Server error. Please try again shortly.";

  return "Request failed. Please try again.";
}

function createApiError({ statusCode, statusText, message, details, raw }) {
  const error = new Error(message);
  error.name = "ApiClientError";
  error.statusCode = statusCode;
  error.statusText = statusText;
  error.details = details || null;
  error.raw = raw;
  return error;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

async function applyRequestInterceptors(config) {
  let next = config;

  for (const interceptor of requestInterceptors) {
    // Interceptors can mutate or replace the request config.
    next = (await interceptor(next)) || next;
  }

  return next;
}

async function applyResponseInterceptors(result) {
  let next = result;

  for (const interceptor of responseInterceptors) {
    next = (await interceptor(next)) || next;
  }

  return next;
}

export function setAuthToken(token) {
  authToken = token || null;
}

export function addRequestInterceptor(interceptor) {
  requestInterceptors.push(interceptor);

  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index >= 0) {
      requestInterceptors.splice(index, 1);
    }
  };
}

export function addResponseInterceptor(interceptor) {
  responseInterceptors.push(interceptor);

  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index >= 0) {
      responseInterceptors.splice(index, 1);
    }
  };
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    query,
    body,
    headers = {},
    signal,
    retries = 2,
    retryDelayMs = 300,
    timeoutMs = 15000,
  } = options;

  const url = new URL(`${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);

  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (authToken && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  if (body !== undefined && body !== null && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let requestConfig = {
    url,
    method,
    headers: requestHeaders,
    body,
    signal,
    timeoutMs,
  };

  requestConfig = await applyRequestInterceptors(requestConfig);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestConfig.timeoutMs);

    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body:
          requestConfig.body !== undefined && requestConfig.body !== null
            ? JSON.stringify(requestConfig.body)
            : undefined,
        signal: requestConfig.signal || controller.signal,
      });

      clearTimeout(timeout);

      const data = await parseResponse(response);

      if (!response.ok) {
        const message =
          data && typeof data === "object"
            ? toFriendlyErrorMessage(response.status, data.error)
            : toFriendlyErrorMessage(response.status, null);

        throw createApiError({
          statusCode: response.status,
          statusText: response.statusText,
          message,
          details: data,
          raw: response,
        });
      }

      const result = await applyResponseInterceptors({
        data,
        response,
        url: requestConfig.url.toString(),
        method: requestConfig.method,
      });

      return result.data;
    } catch (error) {
      clearTimeout(timeout);

      const shouldRetry = attempt < retries && isRetryableError(error);
      if (!shouldRetry) {
        throw error;
      }

      const backoff = retryDelayMs * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }

  throw createApiError({
    statusCode: 0,
    statusText: "Unknown",
    message: "Request failed after retries.",
  });
}

export const apiClient = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => apiRequest(path, { ...options, method: "PUT", body }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" }),
};
