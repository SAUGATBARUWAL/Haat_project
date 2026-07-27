import { useAuth } from "../../context/AuthContext";

export default function ProfileHeader() {
    const { profile } = useAuth();

    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000";

    const profilePicture =
        profile?.customer_profile?.profile_picture ||
        profile?.seller_profile?.profile_picture;  

    const profileImage =
        profilePicture && !profilePicture.startsWith("http")
            ? `${API_BASE_URL}${profilePicture}`
            : profilePicture;

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6"> 
                <div className="flex flex-col items-center">
                    {profileImage && (
                        <img
                            src={profileImage}
                            alt="Profile"
                            className="h-28 w-28 rounded-full object-cover border-4 border-green-600"
                        />
                    )}
                </div>
                <div>
                    <h2 className="mt-4 text-2xl font-bold">
                        {profile?.username}
                    </h2>

                {profile?.role === "seller" && (
                    <div className="mt-4 text-center">
                        <p className="font-semibold">
                            {profile?.seller_profile?.business_name}
                        </p>

                        <p className="text-gray-600">
                            {profile?.seller_profile?.business_address}
                            {profile?.seller_profile?.phone}
                        </p>

                        <p
                            className={`font-medium ${
                                profile?.seller_profile?.verification_status === "verified"
                                ? "text-green-600"
                                    : "text-yellow-600"
                            }`}
                        >
                            {profile?.seller_profile?.verification_status}
                        </p>
                    </div>
               
                )}
                <button className="mt-6 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 transition">
                    Edit Profile
                </button>
                </div>
            </div>
        </div>
    );
}
