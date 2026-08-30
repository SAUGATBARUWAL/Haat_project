import { useState } from "react";
import { useNavigate } from "react-router-dom";

import GreenButton from "../../components/buttons/GreenButton";
import PasswordInput from "../../components/inputs/PasswordInput";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { fetchProfile } = useAuth();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/users/login/", form);
            const data = response.data;

            const profile = await fetchProfile();

            const role = profile?.role || data?.role;

            if (role === "seller") {
                const verificationStatus =
                    data?.verification_status ||
                    profile?.seller_profile?.verification_status;

                if (verificationStatus === "pending") {
                    navigate("/seller/pending-verification");
                } else {
                    navigate("/seller/dashboard");
                }
            } else if (role === "customer") {
                navigate("/");
            } else if (role === "admin") {
                navigate("/admin");
            } else if (role === "rider") {
                navigate("/rider");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Invalid username or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-md shadow-2xl shadow-gray-700/40 p-8">

                {/* Logo / title */}
                <h2 className="text-3xl font-bold text-center text-green-700">
                    HAAT
                </h2>

                <p className="mt-2 text-center text-gray-600">
                    Enter your login credentials
                </p>

                {/* Error */}
                {error && (
                    <div className="mt-4 rounded-lg bg-red-100 p-3 text-center text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">

                    {/* Username */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                            autoComplete="username"
                            disabled={loading}
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Password
                        </label>

                        <PasswordInput
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end -mt-1">
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            disabled={loading}
                            className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline disabled:opacity-50"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Login button */}
                    <GreenButton
                        type="submit"
                        loading={loading}
                    >
                        Login
                    </GreenButton>
                </form>

                {/* Signup */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Not registered?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="font-medium text-green-600 hover:underline"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}