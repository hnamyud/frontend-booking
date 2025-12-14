import { writable } from 'svelte/store';
import { api } from '../api.svelte';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        isAuthenticated: false,
        user: null,
        token: null,
        isAdmin: false,
        isModerator: false,
        adminPermissions: []
    });

    return {
        subscribe,
        login: (token, user, isAdmin = false, isModerator = false, adminPermissions = []) => {
            // Save to localStorage for persistence across tabs
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', token);
            localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
            localStorage.setItem('isModerator', JSON.stringify(isModerator));
            localStorage.setItem('adminPermissions', JSON.stringify(adminPermissions));

            set({ isAuthenticated: true, user, token, isAdmin, isModerator, adminPermissions });
        },
        logout: async () => {
            // Optimistic UI: Clear state immediately
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('isModerator');
            localStorage.removeItem('adminPermissions');
            set({ isAuthenticated: false, user: null, token: null, isAdmin: false, isModerator: false, adminPermissions: [] });

            // Soft navigation to home page (avoids hard reload)
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));

            try {
                // Call centralized logout which handles API and CSRF refresh
                // We await this to ensure the request completes. 
                // Since we are using soft navigation, the JS context remains alive.
                await api.logout();
            } catch (error) {
                console.error('Logout failed', error);
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

                    // Restore admin/moderator state from localStorage
                    const isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
                    const isModerator = JSON.parse(localStorage.getItem('isModerator') || 'false');
                    const adminPermissions = JSON.parse(localStorage.getItem('adminPermissions') || '[]');

                    // Update state
                    localStorage.setItem('accessToken', access_token);
                    localStorage.setItem('user', JSON.stringify(user));
                    set({ isAuthenticated: true, user, token: access_token, isAdmin, isModerator, adminPermissions });
                } else {
                    // If refresh fails (401/403), clear state
                    throw new Error('Refresh failed');
                }
            } catch (error) {
                // Clear state if anything goes wrong
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('isModerator');
                localStorage.removeItem('adminPermissions');
                set({ isAuthenticated: false, user: null, token: null, isAdmin: false, isModerator: false, adminPermissions: [] });
            }
        }
    };
}

export const auth = createAuthStore();
