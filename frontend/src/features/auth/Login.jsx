import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/buttons/GreenButton";
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
            // Login request
            const response = await api.post("/login/", form);
            const data = response.data;

            // Update authentication state
            await fetchProfile();

            // Redirect based on role
            if (data.role === "seller") {
                if (data.verification_status === "pending") {
                    navigate("/seller/pending-verification");
                } else {
                    navigate("/seller/dashboard");
                }
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
                <h2 className="text-3xl font-bold text-center text-green-700">
                    HAAT
                </h2>

                <p className="mt-2 text-center text-gray-600">
                    Enter your login credentials
                </p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-100 p-3 text-center text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <GreenButton type="submit" loading={loading}>
                        Login
                    </GreenButton>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Not registered?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}