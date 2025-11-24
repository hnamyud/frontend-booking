import { writable } from 'svelte/store';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        isAuthenticated: false,
        user: null,
        token: null,
        isAdmin: false,
        adminPermissions: []
    });

    return {
        subscribe,
        login: (token, user, isAdmin = false, adminPermissions = []) => {
            // Save to localStorage for persistence across tabs
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', token);
            localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
            localStorage.setItem('adminPermissions', JSON.stringify(adminPermissions));

            set({ isAuthenticated: true, user, token, isAdmin, adminPermissions });
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
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('adminPermissions');
                set({ isAuthenticated: false, user: null, token: null, isAdmin: false, adminPermissions: [] });
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

                    // Restore admin state from localStorage if available
                    // Note: In a real app, we might want to re-verify admin status here, 
                    // but for now we'll trust localStorage or just user role if we wanted to be simpler.
                    // However, the prompt specifically asked for the verify-admin flow on login.
                    // For refresh, we'll assume the session is still valid. 
                    // Better yet, let's just read from localStorage what we saved during login.
                    const isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
                    const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '[]');

                    // Update state
                    localStorage.setItem('accessToken', access_token);
                    localStorage.setItem('user', JSON.stringify(user));
                    set({ isAuthenticated: true, user, token: access_token, isAdmin, adminPermissions });
                } else {
                    // If refresh fails (401/403), clear state
                    throw new Error('Refresh failed');
                }
            } catch (error) {
                // Clear state if anything goes wrong
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('adminPermissions');
                set({ isAuthenticated: false, user: null, token: null, isAdmin: false, adminPermissions: [] });
            }
        }
    };
}

export const auth = createAuthStore();
