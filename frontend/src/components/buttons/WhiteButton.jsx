export default function WhiteButton({ onClick, disabled, loading, children, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-2 rounded-lg font-medium ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}