import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const AuthContext = createContext();

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const fetchProfile = async () => {
        try {
            const response = await api.get("/profile/");
            setProfile(response.data);
            setLoggedIn(true);
            return response.data;
        } catch (error) {
            setProfile(null);
            setLoggedIn(false);

            if (!PUBLIC_ROUTES.includes(location.pathname)) {
                navigate("/login", { replace: true });
            }

            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = async () => {
        try {
            await api.post("/logout/");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setProfile(null);
            setLoggedIn(false);
            navigate("/login", { replace: true });
        }
    };

    const value = {
        profile,
        loggedIn,
        loading,
        fetchProfile,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }

    return context;
}