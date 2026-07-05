import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/buttons/GreenButton";
import AuthLayout from "../../layouts/AuthLayout";
import { ImageUp } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const MAX_FILE_SIZE_MB = 5;

function SellerSignup() {
    const navigate = useNavigate();
    const { fetchProfile } = useAuth();

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

        if (!/^\d{9}$/.test(formData.pan_number.trim())) {
            newErrors.pan_number = "PAN number must be exactly 9 digits.";
        }

        if (!formData.phone || formData.phone.length < 7) {
            newErrors.phone = "Phone number must be at least 7 digits.";
        }

        if (!formData.business_document) {
            newErrors.business_document = "Business document is required.";
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));

        return Object.keys(newErrors).length === 0;
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

        if (!validate()) return;

        setLoading(true);

        try {
            const data = new FormData();

            Object.keys(formData).forEach((key) => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await api.post("/register/seller/", data);

            // Update authentication state
            await fetchProfile();

            alert("Seller registered successfully. Verification pending.");

            navigate("/");
        } catch (err) {
            alert(extractErrorMessage(err.response?.data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-center text-3xl font-bold">
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

                    <div>
                        <input
                            type="tel"
                            inputMode="numeric"
                            name="phone"
                            placeholder="Phone Number"
                            maxLength={15}
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                        />

                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <input
                        type="text"
                        name="business_name"
                        placeholder="Business Name"
                        required
                        value={formData.business_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <div>
                        <input
                            type="text"
                            inputMode="numeric"
                            name="pan_number"
                            placeholder="PAN Number (9 digits)"
                            maxLength={9}
                            required
                            value={formData.pan_number}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                        />

                        {errors.pan_number && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.pan_number}
                            </p>
                        )}
                    </div>

                    <textarea
                        name="business_address"
                        placeholder="Business Address"
                        rows="2"
                        required
                        value={formData.business_address}
                        onChange={handleChange}
                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <div>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition hover:border-green-600">
                            <ImageUp className="h-10 w-10 text-green-600" />

                            <span className="mt-2 text-sm text-gray-600">
                                {formData.profile_picture
                                    ? formData.profile_picture.name
                                    : "Upload Profile Picture (optional)"}
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
                            <p className="mt-1 text-sm text-red-600">
                                {errors.profile_picture}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition hover:border-green-600">
                            <ImageUp className="h-10 w-10 text-green-600" />

                            <span className="mt-2 text-sm text-gray-600">
                                {formData.business_document
                                    ? formData.business_document.name
                                    : "Upload Business Document (PDF or image)"}
                            </span>

                            <input
                                type="file"
                                name="business_document"
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                                onChange={handleChange}
                                className="hidden"
                            />
                        </label>

                        {errors.business_document && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.business_document}
                            </p>
                        )}
                    </div>

                    <GreenButton
                        type="submit"
                        loading={loading}
                        loadingText="Registering..."
                    >
                        Register
                    </GreenButton>
                </form>

                <p className="mt-6 text-center">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-blue-600 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

export default SellerSignup;