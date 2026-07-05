import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/buttons/GreenButton";
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
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const extractErrorMessage = (data) => {
        if (!data) return "Registration failed. Please try again.";
        if (typeof data === "string") return data;
        if (data.detail) return data.detail;
        if (data.message) return data.message;

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

        try {
            // Register customer
            await api.post("/register/customer/", formData);

            // Update authentication state
            await fetchProfile();

            navigate("/");
        } catch (err) {
            setError(extractErrorMessage(err.response?.data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-center text-3xl font-bold text-green-600">
                    Customer Registration
                </h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-center text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <GreenButton
                        type="submit"
                        loading={loading}
                        loadingText="Registering..."
                    >
                        Register
                    </GreenButton>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-green-600 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

export default CustomerSignup;