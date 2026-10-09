import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_ENDPOINTS } from '../utils/apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            let token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            // Sanitize token
            if (!token || token === 'null' || token === 'undefined') {
                token = null;
                localStorage.removeItem('token');
            }

            if (token && storedUser) {
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1]));
                        if (payload.exp && payload.exp * 1000 < Date.now()) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                        } else {
                            setUser(JSON.parse(storedUser));
                        }
                    }
                } catch (e) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }
        } catch (e) {
            console.error('Auth init error', e);
        } finally {
            // Always unblock render — never keep loading=true indefinitely
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.access_token);
            const userData = { email: data.email, role: data.role, username: data.username || '' };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    };

    const signup = async (email, password, username = '') => {
        try {
            const response = await fetch(API_ENDPOINTS.SIGNUP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Signup failed');
            return true;

        } catch (error) {
            console.error('Signup Error:', error);
            throw error;
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
            {/* FIX: Always render children — never block on loading */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
