// Authentication Service for QuickQual
// Handles login, register, and token management

const API_URL = 'http://localhost:3000/api';

class AuthService {
    constructor() {
        this.token = localStorage.getItem('quickqual_token');
        this.user = JSON.parse(localStorage.getItem('quickqual_user') || 'null');
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            this.setAuth(data.data);
            return data.data;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            this.setAuth(data.data);
            return data.data;
        } catch (error) {
            throw error;
        }
    }

    setAuth(userData) {
        this.token = userData.token;
        this.user = {
            id: userData.id,
            name: userData.name,
            email: userData.email
        };
        localStorage.setItem('quickqual_token', this.token);
        localStorage.setItem('quickqual_user', JSON.stringify(this.user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('quickqual_token');
        localStorage.removeItem('quickqual_user');
    }

    async fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle 401 - unauthorized (token expired)
        if (response.status === 401) {
            this.logout();
            window.location.reload();
        }

        return response;
    }
}

// Export singleton instance
export const authService = new AuthService();
