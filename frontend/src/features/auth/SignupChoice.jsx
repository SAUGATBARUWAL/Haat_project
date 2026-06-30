import { useNavigate } from "react-router-dom";
import GreenButton from "../../components/GreenButton";

export default function SignupChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-600/50 p-8 text-center">

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-700">
          Create an Account
        </h2>
        

        {/* Buttons */}
        <div className="mt-8 space-y-4">

          {/* Customer */}
          <button
            onClick={() => navigate("/signup/customer")}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
          >
            Register as Customer
          </button>

        </div>

        {/* Seller */}
        <p className="text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signup/seller")}
            className="text-blue-600 cursor-pointer font-medium hover:underline"
          >
           Register as seller 
          </span>
        </p>

      </div>
    </div>
  );
}