// components/GreenButton.jsx
export default function GreenButton({ onClick, disabled, loading, children, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}