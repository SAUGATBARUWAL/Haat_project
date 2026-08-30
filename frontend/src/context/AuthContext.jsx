import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import api from "../utils/api";

const AuthContext = createContext();

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
|
| These pages can be visited without authentication.
|
*/

const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/signup",
    "/signup/customer",
    "/signup/seller",
];

/*
|--------------------------------------------------------------------------
| Auth Provider
|--------------------------------------------------------------------------
*/

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    /*
    |--------------------------------------------------------------------------
    | Fetch logged-in user's profile
    |--------------------------------------------------------------------------
    */

    const fetchProfile = async () => {
        try {
            const response = await api.get(
                "/users/profile/"
            );

            const userProfile = response.data;

            console.log(
                "Authenticated profile:",
                userProfile
            );

            setProfile(userProfile);
            setLoggedIn(true);

            return userProfile;

        } catch (error) {
            console.error(
                "Failed to fetch profile:",
                error
            );

            setProfile(null);
            setLoggedIn(false);

            /*
            |--------------------------------------------------------------------------
            | Only redirect when necessary
            |--------------------------------------------------------------------------
            */

            if (
                !PUBLIC_ROUTES.includes(
                    location.pathname
                )
            ) {
                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );
            }

            return null;

        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Load authentication when application starts
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchProfile();

        // Auth check intentionally runs once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const logout = async () => {
        try {
            await api.post(
                "/users/logout/"
            );

        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );

        } finally {
            setProfile(null);
            setLoggedIn(false);

            navigate(
                "/login",
                {
                    replace: true,
                }
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Role detection
    |--------------------------------------------------------------------------
    |
    | Your Django User model has roles such as:
    |
    | customer
    | seller
    | admin
    | rider
    |
    */

    const role =
        profile?.role?.toLowerCase() || null;

    const isCustomer =
        role === "customer";

    const isSeller =
        role === "seller";

    const isAdmin =
        role === "admin";

    const isRider =
        role === "rider";

    /*
    |--------------------------------------------------------------------------
    | Rider profile
    |--------------------------------------------------------------------------
    |
    | Depending on your serializer, rider information may be returned as:
    |
    | profile.rider_profile
    |
    */

    const riderProfile =
        profile?.rider_profile || null;

    /*
    |--------------------------------------------------------------------------
    | Context value
    |--------------------------------------------------------------------------
    */

    const value = {
        /*
        | User profile
        */
        profile,

        /*
        | Authentication state
        */
        loggedIn,
        loading,

        /*
        | Role
        */
        role,

        /*
        | Role helpers
        */
        isCustomer,
        isSeller,
        isAdmin,
        isRider,

        /*
        | Rider
        */
        riderProfile,

        /*
        | Authentication functions
        */
        fetchProfile,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/*
|--------------------------------------------------------------------------
| useAuth
|--------------------------------------------------------------------------
*/

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
}