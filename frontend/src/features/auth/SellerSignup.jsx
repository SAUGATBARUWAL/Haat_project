import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/GreenButton";
import { ImageUp } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MAX_FILE_SIZE_MB = 5;

function SellerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    business_name: "",
    pan_number: "",
    business_address: "",
    profile_picture: null,
    business_document: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];

      if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: `File must be smaller than ${MAX_FILE_SIZE_MB}MB`,
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, [name]: null }));
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 15);
      setErrors((prev) => ({ ...prev, [name]: null }));
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: null }));
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number.trim())) {
      newErrors.pan_number = "Enter a valid PAN number (e.g. ABCDE1234F)";
    }

    if (formData.phone && formData.phone.length < 7) {
      newErrors.phone = "Phone number must be at least 7 digits";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
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

    if (!validate()) return;

    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/register/seller/`, {
        method: "POST",
        body: data,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(extractErrorMessage(result));
      }

      alert("Seller registered successfully. Verification pending.");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Seller Registration
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

          <div>
            <input
              type="tel"
              inputMode="numeric"
              name="phone"
              placeholder="Phone Number"
              maxLength={15}
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <input
            type="text"
            name="business_name"
            placeholder="Business Name"
            required
            value={formData.business_name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
          />

          <div>
            <input
              type="text"
              name="pan_number"
              placeholder="PAN Number"
              required
              value={formData.pan_number}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 uppercase focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.pan_number && (
              <p className="text-red-600 text-sm mt-1">{errors.pan_number}</p>
            )}
          </div>

          <textarea
            name="business_address"
            placeholder="Business Address"
            rows="2"
            required
            value={formData.business_address}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
          />

          {/* Profile Picture */}
          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-green-600 transition">
              <ImageUp className="w-10 h-10 text-green-600" />
              <span className="mt-2 text-sm text-gray-600">
                {formData.profile_picture
                  ? formData.profile_picture.name
                  : "Upload Profile Picture"}
              </span>
              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.profile_picture && (
              <p className="text-red-600 text-sm mt-1">
                {errors.profile_picture}
              </p>
            )}
          </div>

          {/* Business Document */}
          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-green-600 transition mt-4">
              <ImageUp className="w-10 h-10 text-green-600" />
              <span className="mt-2 text-sm text-gray-600">
                {formData.business_document
                  ? formData.business_document.name
                  : "Upload Business Document"}
              </span>
              <input
                type="file"
                name="business_document"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {errors.business_document && (
              <p className="text-red-600 text-sm mt-1">
                {errors.business_document}
              </p>
            )}
          </div>

          <GreenButton type="submit" loading={loading} loadingText="Registering...">
            Register
          </GreenButton>
        </form>

        <p className="text-center mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default SellerSignup;
