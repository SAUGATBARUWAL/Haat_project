import { useNavigate } from "react-router-dom";

export default function SignupChoice() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-600/50 p-8 text-center">

                <h2 className="text-2xl font-bold text-gray-700">
                    Create an Account
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                    Choose how you'd like to join
                </p>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => navigate("/signup/customer")}
                        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
                    >
                        Register as Customer
                    </button>

                    <button
                        onClick={() => navigate("/signup/seller")}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                        Register as Seller
                    </button>
                </div>

                <p className="text-sm mt-6 text-gray-600">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/")}
                        className="text-green-600 cursor-pointer font-medium hover:underline"
                    >
                        Log in
                    </span>
                </p>
            </div>
        </div>
    );
}