import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import GreenButton from "../../components/GreenButton";

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
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save JWT tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role", data.role);

      // Navigate based on role
      if (data.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-600/50 p-8">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-green-600">
          HAAT   
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Enter your login credentials
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <GreenButton
            type="submit"
            loading={loading}
            loadingText="Logging in..."
          >
            Login
          </GreenButton>
        </form>

        {/* Sign up */}
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