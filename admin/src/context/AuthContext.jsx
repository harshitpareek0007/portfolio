import { createContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const data = await getMe();
            setAdmin(data.admin);
        } catch (error) {
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        setAdmin(data.admin);
        return data;
    };

    const logout = async () => {
        await apiLogout();
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
