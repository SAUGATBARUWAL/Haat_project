import { useState } from "react";
import { useNavigate } from "react-router-dom";

import GreenButton from "../../components/buttons/GreenButton";
import PasswordInput from "../../components/inputs/PasswordInput";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function CustomerSignup() {
    const navigate = useNavigate();
    const { fetchProfile } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const extractErrorMessage = (data) => {
        if (!data) {
            return "Registration failed. Please try again.";
        }

        if (typeof data === "string") {
            return data;
        }

        if (data.detail) {
            return data.detail;
        }

        if (data.message) {
            return data.message;
        }

        const firstKey = Object.keys(data)[0];

        if (firstKey) {
            const value = data[firstKey];
            const text = Array.isArray(value) ? value[0] : value;

            return `${firstKey}: ${text}`;
        }

        return "Registration failed. Please try again.";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        // Check passwords before sending anything to Django
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            /*
             * Do NOT send confirmPassword to the backend.
             *
             * Only send the fields your Django registration
             * serializer expects.
             */
            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            };

            await api.post(
                "/api/users/register/customer/",
                registrationData
            );

            /*
             * Fetch the authenticated user's profile.
             */
            const profile = await fetchProfile();

            /*
             * If registration automatically logs the user in,
             * this will populate AuthContext.
             */
            if (profile) {
                navigate("/");
            } else {
                /*
                 * If your backend does NOT automatically log the
                 * user in after registration, send them to login.
                 */
                navigate("/login");
            }

        } catch (err) {
            setError(extractErrorMessage(err.response?.data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">

                {/* Heading */}
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-green-600">
                        Create Account
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Join HAAT and start shopping
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-center text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Username */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            placeholder="Enter username"
                            required
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <PasswordInput
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            autoComplete="new-password"
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <PasswordInput
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            autoComplete="new-password"
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100"
                        />

                        {formData.confirmPassword &&
                            formData.password !== formData.confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">
                                    Passwords do not match.
                                </p>
                            )}

                        {formData.confirmPassword &&
                            formData.password === formData.confirmPassword && (
                                <p className="mt-1 text-xs text-green-600">
                                    Passwords match.
                                </p>
                            )}
                    </div>

                    {/* Register */}
                    <GreenButton
                        type="submit"
                        loading={loading}
                        loadingText="Creating account..."
                    >
                        Register
                    </GreenButton>
                </form>

                {/* Login */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-medium text-green-600 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

export default CustomerSignup;

