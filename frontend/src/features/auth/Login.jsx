import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/buttons/GreenButton";
import AuthLayout from "../../layouts/AuthLayout";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();

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
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",

        // Required for HTTP-only JWT cookies
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Invalid username or password."
        );
      }

      /*
       * DO NOT store tokens in localStorage.
       * The backend already stores them as HTTP-only cookies.
       */

      // Redirect according to role if returned by backend
      if (data.role === "seller") {
        navigate("/seller/dashboard");
      } else if (data.role === "customer") {
        navigate("/");
      } else {
        // Fallback
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
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

        <p className="text-center text-gray-600 mt-2">
          Enter your login credentials
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-center text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              className="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <GreenButton
            type="submit"
            loading={loading}
          >
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