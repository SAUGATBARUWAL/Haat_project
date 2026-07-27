import { Outlet } from "react-router-dom";
import SellerSidebar from "./SellerSidebar";

export default function SellerDashboard() {
    return (
        <div className="min-h-screen bg-gray-100">

            <div className="min-h-screen bg-gray-100 flex">

                {/* Left Sidebar */}

                <SellerSidebar />

                {/* Right Content */}

                <main className="flex-1 p-8">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}