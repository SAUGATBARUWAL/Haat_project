import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "./ProfileHeader";
import CustomerProfile from "./CustomerProfile";
import SellerProfile from "./SellerProfile";

export default function Profile() {
    const { profile } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            {/* Shared Profile Header */}
            <ProfileHeader />

            {/* Role-specific Section */}
            <div className="max-w-5xl mx-auto mt-8">
                {profile?.role === "customer" && <CustomerProfile />}

                {profile?.role === "seller" && <SellerProfile />}
            </div>
        </div>
    );
}