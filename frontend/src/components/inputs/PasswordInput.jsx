import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
    name = "password",
    value,
    onChange,
    placeholder = "Password",
    required = false,
    disabled = false,
    className = "",
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full rounded-lg border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 ${className}`}
            />

            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={disabled}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <EyeOff size={20} />
                ) : (
                    <Eye size={20} />
                )}
            </button>
        </div>
    );
}