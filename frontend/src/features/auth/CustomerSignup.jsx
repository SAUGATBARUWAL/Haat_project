import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/buttons/GreenButton";
import AuthLayout from "../../layouts/AuthLayout";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function CustomerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const extractErrorMessage = (result) => {
    if (!result) return "Registration failed. Please try again.";
    if (typeof result === "string") return result;
    if (result.detail) return result.detail;
    if (result.message) return result.message;

    const firstKey = Object.keys(result)[0];
    if (firstKey) {
      const value = result[firstKey];
      const text = Array.isArray(value) ? value[0] : value;
      return `${firstKey}: ${text}`;
    }

    return "Registration failed. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register/customer/`, {
        method: "POST",
        credentials: "include", // required to store the auto-login cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractErrorMessage(result));
      }

      alert("Customer registered successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
          Customer Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
          />

          <GreenButton
            type="submit"
            loading={loading}
            loadingText="Registering..."
          >
            Register
          </GreenButton>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-green-600 hover:underline "
          >
            Login
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default CustomerSignup;