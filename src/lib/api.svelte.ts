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
        if (params.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        const url = `/api/v1/tour${queryString ? `?${queryString}` : ''}`;
        return this.request<GetToursResponse>(url, 'GET', undefined, this.getAuthHeaders());
    }

    async getTour(id: string) {
        return this.request<GetTourResponse>(`/api/v1/tour/${id}`, 'GET', undefined, this.getAuthHeaders());
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

    // Booking API
    async getBookings(params: GetBookingsParams = {}) {
        const queryParams = new URLSearchParams();
        if (params.current) queryParams.append('current', params.current.toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

        const queryString = queryParams.toString();
        const url = `/api/v1/bookings${queryString ? `?${queryString}` : ''}`;
        return this.request<GetBookingsResponse>(url, 'GET', undefined, this.getAuthHeaders());
    }

    async updateBooking(id: string, data: UpdateBookingPayload) {
        return this.request<any>(`/api/v1/bookings/${id}`, 'PATCH', data, this.getAuthHeaders());
    }

    async deleteBooking(id: string) {
        return this.request<any>(`/api/v1/bookings/${id}`, 'DELETE', undefined, this.getAuthHeaders());
    }

    // Payment API
    async getPayments(params: GetPaymentsParams = {}) {
        const queryParams = new URLSearchParams();
        if (params.current) queryParams.append('current', params.current.toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

        const queryString = queryParams.toString();
        const url = `/api/v1/payments${queryString ? `?${queryString}` : ''}`;
        return this.request<GetPaymentsResponse>(url, 'GET', undefined, this.getAuthHeaders());
    }

    async updatePayment(id: string, data: UpdatePaymentPayload) {
        return this.request<any>(`/api/v1/payments/${id}`, 'PATCH', data, this.getAuthHeaders());
    }

    async deletePayment(id: string) {
        return this.request<any>(`/api/v1/payments/${id}`, 'DELETE', undefined, this.getAuthHeaders());
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
    sort?: string;
}

export interface Tour {
    _id: string;
    name: string;
    description: string;
    duration: string;
    durationDays: number;
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

export interface GetTourResponse {
    statusCode: number;
    message: string;
    data: Tour;
}

export interface CreateTourPayload {
    name: string;
    description: string;
    duration: string;
    durationDays: number;
    price: number;
    timeStart: string;
    timeEnd: string;
    totalSlots: number;
    isAvailable: boolean;
    destinations: string[];
}

// Booking Interfaces
export interface GetBookingsParams {
    current?: number;
    pageSize?: number;
}

export interface BookingContactInfo {
    fullName: string;
    phone: string;
    email: string;
}

export interface Booking {
    _id: string;
    tour_id: string;
    user_id: string;
    numberOfGuests: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'FAILED' | 'COMPLETED';
    payment_status: 'PENDING' | 'SUCCESS' | 'FAILED';
    contactInfo: BookingContactInfo;
    note: string;
    isUsed: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    payment_id?: string;
    ticketCode?: string;
    checkinAt?: string;
}

export interface GetBookingsResponse {
    statusCode: number;
    message: string;
    data: {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        };
        result: Booking[];
    };
}

export interface UpdateBookingPayload {
    status?: string;
    payment_status?: string;
    contactInfo?: BookingContactInfo;
    note?: string;
}

// Payment Interfaces
export interface GetPaymentsParams {
    current?: number;
    pageSize?: number;
}

export interface Payment {
    _id: string;
    booking_id: string;
    user_id: string;
    code: string;
    provider: string; // e.g., 'VNPAY'
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GetPaymentsResponse {
    statusCode: number;
    message: string;
    data: {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        };
        result: Payment[];
    };
}

export interface UpdatePaymentPayload {
    status: string;
}

export const api = new ApiClient();
