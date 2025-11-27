class ApiClient {
    csrfToken = $state<string | null>(null);
    isAuthenticated = $state<boolean>(false);

    constructor() {
        // Optional: Auto-init on client-side mount if needed, 
        // but usually explicit init is better for control.
    }

    async init() {
        try {
            const res = await fetch('/api/v1/csrf-token', {
                method: 'GET',
                credentials: 'include' // Crucial for receiving the initial cookie
            });

            if (!res.ok) {
                console.error('Failed to fetch CSRF token');
                return;
            }

            const data = await res.json();
            this.csrfToken = data.csrfToken;
        } catch (err) {
            console.error('Error initializing API client:', err);
        }
    }

    async request<T>(url: string, method: string = 'GET', body?: any, customHeaders: HeadersInit = {}, extraOptions: RequestInit = {}): Promise<T> {
        // Ensure we have a token before making a request that might need it
        if (!this.csrfToken) {
            await this.init();
        }

        const isFormData = body instanceof FormData;
        const headers: Record<string, string> = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(customHeaders as Record<string, string>)
        };

        // Add CSRF header for mutating requests
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
            if (this.csrfToken) {
                headers['x-csrf-token'] = this.csrfToken;
            } else {
                console.warn('Making a mutating request without a CSRF token!');
            }
        }

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include', // Mandatory for HttpOnly cookies
            ...extraOptions
        };

        if (body) {
            options.body = isFormData ? body : JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            // Handle 401/403 specifically if needed, or just throw
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Return null for 204 No Content, otherwise parse JSON
        if (response.status === 204) {
            return null as T;
        }

        return response.json();
    }

    async login(email: string, password: string) {
        try {
            const response = await this.request<any>('/api/v1/auth/login', 'POST', { email, password });

            this.isAuthenticated = true;

            // CRITICAL: Refresh CSRF token because session changed
            await this.init();

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const token = localStorage.getItem('accessToken');
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            // Use keepalive to ensure request completes even if page unloads
            await this.request('/api/v1/auth/logout', 'POST', undefined, headers, { keepalive: true });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.isAuthenticated = false;
            // CRITICAL: Get a new guest CSRF token so the user can log in again immediately
            await this.init();
        }
    }
}

export const api = new ApiClient();
