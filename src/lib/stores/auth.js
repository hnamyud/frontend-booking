import { writable } from 'svelte/store';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        isAuthenticated: false,
        user: null,
        token: null
    });

    return {
        subscribe,
        login: (token, user) => {
            // Save to localStorage for persistence across tabs (optional, but good for UX if cookie is session only)
            // However, with HttpOnly cookie for refresh token, we mainly rely on memory for access token
            // But user info can be stored in localStorage for display purposes
            localStorage.setItem('user', JSON.stringify(user));
            // Access token is usually kept in memory if we have a refresh token flow, 
            // but here we are asked to save it to memory/localStorage in the prompt for /refresh success.
            // The prompt says: "If Success: Save 'response.data.access_token' to localStorage key 'accessToken'" in the first step,
            // and "If 200 OK: Save new `access_token` to memory/localStorage" in this step.
            // I will keep it consistent and save to localStorage as well for now, although memory is safer.
            localStorage.setItem('accessToken', token);

            set({ isAuthenticated: true, user, token });
        },
        logout: async () => {
            try {
                // Call logout endpoint to clear cookie on server
                const token = localStorage.getItem('accessToken');
                await fetch('http://localhost:8080/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include' // CRITICAL: Required for HttpOnly cookie
                });
            } catch (error) {
                console.error('Logout failed', error);
            } finally {
                // Clear client state regardless of server response
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                set({ isAuthenticated: false, user: null, token: null });
                window.location.href = '/';
            }
        },
        init: async () => {
            try {
                // Try to refresh token using HttpOnly cookie
                const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
                    method: 'GET',
                    credentials: 'include' // CRITICAL: Required for HttpOnly cookie
                });

                if (response.status === 200) {
                    const data = await response.json();
                    const { access_token, user } = data.data;

                    // Update state
                    localStorage.setItem('accessToken', access_token);
                    localStorage.setItem('user', JSON.stringify(user));
                    set({ isAuthenticated: true, user, token: access_token });
                } else {
                    // If refresh fails (401/403), clear state
                    throw new Error('Refresh failed');
                }
            } catch (error) {
                // Clear state if anything goes wrong
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                set({ isAuthenticated: false, user: null, token: null });
            }
        }
    };
}

export const auth = createAuthStore();
