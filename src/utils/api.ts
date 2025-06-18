// frontend/src/utils/api.ts

export async function authenticatedFetch<T>(
    input: RequestInfo,
    init: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("access_token");
    const isFormData = init.body instanceof FormData;

    function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
        if (!headers) return {};
        if (headers instanceof Headers) {
            const result: Record<string, string> = {};
            headers.forEach((v, k) => result[k] = v);
            return result;
        }
        if (Array.isArray(headers)) {
            return Object.fromEntries(headers);
        }
        return headers as Record<string, string>;
    }

    const customHeaders: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...normalizeHeaders(init.headers),
    };

    const res = await fetch(input, { ...init, headers: customHeaders });
    if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("Unauthorized – redirecting to login");
    }
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
}


