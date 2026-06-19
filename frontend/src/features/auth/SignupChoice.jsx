import { useNavigate } from "react-router-dom";

export default function SignupChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800">
          Create an Account
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose how you want to register
        </p>

        {/* Buttons */}
        <div className="mt-8 space-y-4">

          {/* Customer */}
          <button
            onClick={() => navigate("/signup/customer")}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
          >
            Register as Customer
          </button>

          {/* Seller */}
          <button
            onClick={() => navigate("/signup/seller")}
            className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition font-medium"
          >
            Register as Seller
          </button>

        </div>

        {/* Back to login */}
        <p className="text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer font-medium hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}