import React, { createContext, useState, useEffect } from 'react';
import { config } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await fetch(`${config.API_URL}/api/auth/me`, {
                ...config.fetchOptions,
                headers: config.authHeaders(token)
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const data = await response.json();
            setUser(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err.message);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${config.API_URL}/api/auth/register`, {
                ...config.fetchOptions,
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            await fetchUserData(data.token);
            return data;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch(`${config.API_URL}/api/auth/login`, {
                ...config.fetchOptions,
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            await fetchUserData(data.token);
            return data;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}; 