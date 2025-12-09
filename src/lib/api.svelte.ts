class ApiClient {
    isAuthenticated = $state<boolean>(false);

    constructor() {
        // Optional: Auto-init on client-side mount if needed, 
        // but usually explicit init is better for control.
    }

    async request<T>(url: string, method: string = 'GET', body?: any, customHeaders: HeadersInit = {}, extraOptions: RequestInit = {}): Promise<T> {
        const isFormData = body instanceof FormData;
        const headers: Record<string, string> = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(customHeaders as Record<string, string>)
        };

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
        }
    }

    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('accessToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Tour API
    async getTours(params: GetToursParams = {}) {
        const queryParams = new URLSearchParams();
        if (params.current) queryParams.append('current', params.current.toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
        if (params.destinationName) queryParams.append('destinationName', params.destinationName);
        if (params.priceMin) queryParams.append('priceMin', params.priceMin.toString());
        if (params.priceMax) queryParams.append('priceMax', params.priceMax.toString());
        if (params.timeStart_from) queryParams.append('timeStart_from', params.timeStart_from);
        if (params.timeEnd_to) queryParams.append('timeEnd_to', params.timeEnd_to);

        const queryString = queryParams.toString();
        const url = `/api/v1/tour${queryString ? `?${queryString}` : ''}`;
        return this.request<GetToursResponse>(url, 'GET', undefined, this.getAuthHeaders());
    }

    async createTour(data: CreateTourPayload) {
        return this.request<any>('/api/v1/tour/', 'POST', data, this.getAuthHeaders());
    }

    async updateTour(id: string, data: CreateTourPayload) {
        return this.request<any>(`/api/v1/tour/${id}`, 'PATCH', data, this.getAuthHeaders());
    }

    async deleteTour(id: string) {
        return this.request<any>(`/api/v1/tour/${id}`, 'DELETE', undefined, this.getAuthHeaders());
    }
}

export interface GetToursParams {
    current?: number;
    pageSize?: number;
    destinationName?: string;
    priceMin?: number;
    priceMax?: number;
    timeStart_from?: string;
    timeEnd_to?: string;
}

export interface Tour {
    _id: string;
    name: string;
    description: string;
    duration: string;
    price: number;
    timeStart: string;
    timeEnd: string;
    totalSlots: number;
    availableSlots: number;
    bookedParticipants: number;
    isAvailable: boolean;
    destinations: any[]; // Define specific type if needed
    images?: { url: string; public_id: string }[];
    createdAt: string;
    updatedAt: string;
}

export interface GetToursResponse {
    statusCode: number;
    message: string;
    data: {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        };
        result: Tour[];
    };
}

export interface CreateTourPayload {
    name: string;
    description: string;
    duration: string;
    price: number;
    timeStart: string;
    timeEnd: string;
    totalSlots: number;
    isAvailable: boolean;
    destinations: string[];
}

export const api = new ApiClient();
