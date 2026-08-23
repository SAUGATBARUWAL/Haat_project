import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ImageUp,
    Store,
    Phone,
    CreditCard,
    MapPin,
    User,
    Mail,
    FileText,
} from "lucide-react";

import GreenButton from "../../components/buttons/GreenButton";
import PasswordInput from "../../components/inputs/PasswordInput";
import AuthLayout from "../../layouts/AuthLayout";
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
        confirmPassword: "",
        phone: "",
        business_name: "",
        pan_number: "",
        business_address: "",
        profile_picture: null,
        business_document: null,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    /*
     * Handle input changes
     */
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        /*
         * File inputs
         */
        if (files) {
            const file = files[0];

            if (
                file &&
                file.size > MAX_FILE_SIZE_MB * 1024 * 1024
            ) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: `File must be smaller than ${MAX_FILE_SIZE_MB}MB.`,
                }));

                return;
            }

            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));

            setFormData((prev) => ({
                ...prev,
                [name]: file || null,
            }));

            return;
        }

        /*
         * Phone number
         * Only allow digits.
         */
        if (name === "phone") {
            const digitsOnly = value
                .replace(/\D/g, "")
                .slice(0, 15);

            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));

            setFormData((prev) => ({
                ...prev,
                [name]: digitsOnly,
            }));

            return;
        }

        /*
         * PAN number
         * Only allow digits and maximum 9 characters.
         */
        if (name === "pan_number") {
            const digitsOnly = value
                .replace(/\D/g, "")
                .slice(0, 9);

            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));

            setFormData((prev) => ({
                ...prev,
                [name]: digitsOnly,
            }));

            return;
        }

        /*
         * Normal inputs
         */
        setErrors((prev) => ({
            ...prev,
            [name]: null,
        }));

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * Validate form before sending it to Django.
     */
    const validate = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        }

        if (formData.password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters.";
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        if (
            !formData.phone ||
            formData.phone.length < 7
        ) {
            newErrors.phone =
                "Phone number must be at least 7 digits.";
        }

        if (!formData.business_name.trim()) {
            newErrors.business_name =
                "Business name is required.";
        }

        if (!/^\d{9}$/.test(formData.pan_number.trim())) {
            newErrors.pan_number =
                "PAN number must be exactly 9 digits.";
        }

        if (!formData.business_address.trim()) {
            newErrors.business_address =
                "Business address is required.";
        }

        if (!formData.business_document) {
            newErrors.business_document =
                "Business document is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /*
     * Extract useful error message from Django.
     */
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

            const text = Array.isArray(value)
                ? value[0]
                : value;

            return `${firstKey}: ${text}`;
        }

        return "Registration failed. Please try again.";
    };

    /*
     * Submit registration.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            /*
             * FormData is required because we are
             * uploading images/files.
             */
            const data = new FormData();

            data.append(
                "username",
                formData.username
            );

            data.append(
                "email",
                formData.email
            );

            data.append(
                "password",
                formData.password
            );

            data.append(
                "phone",
                formData.phone
            );

            data.append(
                "business_name",
                formData.business_name
            );

            data.append(
                "pan_number",
                formData.pan_number
            );

            data.append(
                "business_address",
                formData.business_address
            );

            /*
             * Profile picture is optional.
             */
            if (formData.profile_picture) {
                data.append(
                    "profile_picture",
                    formData.profile_picture
                );
            }

            /*
             * Business document is required.
             */
            data.append(
                "business_document",
                formData.business_document
            );

            await api.post(
                "/register/seller/",
                data
            );

            /*
             * Registration automatically authenticates
             * the seller through the Django backend.
             */
            await fetchProfile();

            navigate("/");

        } catch (err) {
            console.error(
                "Seller registration failed:",
                err
            );

            const backendData =
                err.response?.data;

            /*
             * Convert Django errors into a readable
             * message.
             */
            const message =
                extractErrorMessage(
                    backendData
                );

            /*
             * If the error belongs to a specific field,
             * show it under that field where possible.
             */
            if (
                backendData &&
                typeof backendData === "object" &&
                !backendData.detail &&
                !backendData.message
            ) {
                const fieldErrors = {};

                Object.entries(
                    backendData
                ).forEach(([field, value]) => {
                    fieldErrors[field] =
                        Array.isArray(value)
                            ? value[0]
                            : value;
                });

                setErrors(fieldErrors);
            } else {
                setErrors({
                    general: message,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>

            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">

                {/* Heading */}
                <div className="mb-7 text-center">

                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Store size={28} />
                    </div>

                    <h2 className="text-3xl font-bold text-green-600">
                        Create Seller Account
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Register your business and start selling on HAAT
                    </p>

                </div>

                {/* General Error */}
                {errors.general && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                        {errors.general}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* ========================= */}
                    {/* ACCOUNT INFORMATION */}
                    {/* ========================= */}

                    <div>

                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Account Information
                        </h3>

                        <div className="space-y-4">

                            {/* Username */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Username
                                </label>

                                <div className="relative">

                                    <User
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Enter username"
                                        required
                                        autoComplete="username"
                                        value={
                                            formData.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-4
                                            py-3
                                            pl-10
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-200
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                                {errors.username && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.username}
                                    </p>
                                )}

                            </div>

                            {/* Email */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Email
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        required
                                        autoComplete="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-4
                                            py-3
                                            pl-10
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-200
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* Phone */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        name="phone"
                                        placeholder="98XXXXXXXX"
                                        maxLength={15}
                                        required
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-4
                                            py-3
                                            pl-10
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-200
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.phone}
                                    </p>
                                )}

                            </div>

                            {/* Password */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Password
                                </label>

                                <PasswordInput
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Create a password"
                                    required
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* Confirm Password */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>

                                <PasswordInput
                                    name="confirmPassword"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Confirm your password"
                                    required
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                {formData.confirmPassword &&
                                    formData.password !==
                                        formData.confirmPassword && (
                                        <p className="mt-1 text-xs text-red-500">
                                            Passwords do not match.
                                        </p>
                                    )}

                                {formData.confirmPassword &&
                                    formData.password ===
                                        formData.confirmPassword && (
                                        <p className="mt-1 text-xs text-green-600">
                                            Passwords match.
                                        </p>
                                    )}

                            </div>

                        </div>

                    </div>

                    {/* ========================= */}
                    {/* BUSINESS INFORMATION */}
                    {/* ========================= */}

                    <div className="border-t border-gray-100 pt-5">

                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Business Information
                        </h3>

                        <div className="space-y-4">

                            {/* Business Name */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Business Name
                                </label>

                                <div className="relative">

                                    <Store
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        name="business_name"
                                        placeholder="Enter your business name"
                                        required
                                        maxLength={100}
                                        value={
                                            formData.business_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-4
                                            py-3
                                            pl-10
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-200
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                                {errors.business_name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.business_name}
                                    </p>
                                )}

                            </div>

                            {/* PAN */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    PAN Number
                                </label>

                                <div className="relative">

                                    <CreditCard
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        name="pan_number"
                                        placeholder="9 digit PAN number"
                                        maxLength={9}
                                        required
                                        value={
                                            formData.pan_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-4
                                            py-3
                                            pl-10
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-200
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                                {errors.pan_number && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.pan_number}
                                    </p>
                                )}

                            </div>

                            {/* Business Address */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Business Address
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="absolute left-3 top-3 text-gray-400"
                                    />

                                    <textarea
                                        name="business_address"
                                        placeholder="Enter your business address"
                                        rows={3}
                                        required
                                        value={
                                            formData.business_address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="
                                            w-full
                                            resize-none
                                            rounded-lg
                                            border
                                            border-gray-300
                                            px-4
                                            py-3
                                            pl-10
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-green-500
                                            focus:ring-2
                                            focus:ring-green-200
                                            disabled:bg-gray-100
                                        "
                                    />

                                </div>

                                {errors.business_address && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.business_address}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* ========================= */}
                    {/* DOCUMENTS */}
                    {/* ========================= */}

                    <div className="border-t border-gray-100 pt-5">

                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Verification Documents
                        </h3>

                        <div className="space-y-4">

                            {/* Profile Picture */}
                            <div>

                                <label className="
                                    flex
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    border-gray-300
                                    bg-gray-50
                                    p-6
                                    text-center
                                    transition
                                    hover:border-green-500
                                    hover:bg-green-50
                                ">

                                    <ImageUp
                                        size={36}
                                        className="text-green-600"
                                    />

                                    <span className="mt-3 text-sm font-medium text-gray-700">
                                        {formData.profile_picture
                                            ? formData.profile_picture.name
                                            : "Upload Profile Picture"}
                                    </span>

                                    <span className="mt-1 text-xs text-gray-400">
                                        Optional • Maximum 5MB
                                    </span>

                                    <input
                                        type="file"
                                        name="profile_picture"
                                        accept="image/*"
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="hidden"
                                    />

                                </label>

                                {errors.profile_picture && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.profile_picture}
                                    </p>
                                )}

                            </div>

                            {/* Business Document */}
                            <div>

                                <label className="
                                    flex
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    border-gray-300
                                    bg-gray-50
                                    p-6
                                    text-center
                                    transition
                                    hover:border-green-500
                                    hover:bg-green-50
                                ">

                                    <FileText
                                        size={36}
                                        className="text-green-600"
                                    />

                                    <span className="mt-3 text-sm font-medium text-gray-700">
                                        {formData.business_document
                                            ? formData.business_document.name
                                            : "Upload Business Document"}
                                    </span>

                                    <span className="mt-1 text-xs text-gray-400">
                                        Required • PDF, JPG, JPEG or PNG • Maximum 5MB
                                    </span>

                                    <input
                                        type="file"
                                        name="business_document"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                        className="hidden"
                                    />

                                </label>

                                {errors.business_document && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.business_document}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* Register */}
                    <div className="pt-2">

                        <GreenButton
                            type="submit"
                            loading={loading}
                            loadingText="Creating seller account..."
                        >
                            Register Seller
                        </GreenButton>

                    </div>

                </form>

                {/* Login */}
                <p className="mt-6 text-center text-sm text-gray-600">

                    Already have a seller account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                        disabled={loading}
                        className="
                            font-medium
                            text-green-600
                            hover:underline
                            disabled:opacity-50
                        "
                    >
                        Login
                    </button>

                </p>

            </div>

        </AuthLayout>
    );
}

export default SellerSignup;