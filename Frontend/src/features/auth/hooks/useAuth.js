
/* eslint-disable no-unused-vars */

import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
    login,
    register,
    logout,
    getMe
} from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        try {
            const data = await login({ email, password });

            setUser(data.user);

            return data;
        } catch (err) {
            console.log("Login error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);

        try {
            const data = await register({
                username,
                email,
                password
            });

            setUser(data.user);

            return data;
        } catch (err) {
            console.log("Register error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
            setUser(null);
        } catch (err) {
            console.log("Logout error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    };
};

