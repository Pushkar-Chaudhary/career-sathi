
import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionError, setSessionError] = useState(false);
    const [sessionAttempt, setSessionAttempt] = useState(0);

    useEffect(() => {
        let isMounted = true;

        getMe()
            .then((data) => {
                if (isMounted) setUser(data.user);
            })
            .catch((error) => {
                if (!isMounted) return;
                setUser(null);
                if (error.response?.status !== 401) setSessionError(true);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [sessionAttempt]);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
                sessionError,
                retrySession: () => {
                    setSessionError(false);
                    setLoading(true);
                    setSessionAttempt((attempt) => attempt + 1);
                }
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

