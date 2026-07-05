import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });
    failedQueue = [];
};

// CHANGED: Added this array. Previously only "/token/refresh/" was
// excluded from the auto-refresh-and-retry logic below. That meant a
// genuine 401 from /login/ (e.g. wrong password) was ALSO being treated
// as "access token expired, try refreshing" — which triggered a refresh
// call, which failed (no refresh cookie exists yet, since login itself
// just failed), and THAT error overwrote the real login error in the
// UI. Now all public/unauthenticated auth endpoints are excluded, so a
// 401 from them is passed straight through as the real error.
const PUBLIC_AUTH_PATHS = [
    "/token/refresh/",
    "/login/",
    "/register/customer/",
    "/register/seller/",
    "/password-reset/",
];

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            // CHANGED: was `!originalRequest.url.includes("/token/refresh/")`
            // now checks against the full PUBLIC_AUTH_PATHS list instead of
            // just the one refresh path
            !PUBLIC_AUTH_PATHS.some((path) => originalRequest.url.includes(path))
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post("/token/refresh/");
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;