import { useEffect, useState } from "react";
import { Power, Loader2 } from "lucide-react";
import api from "../../utils/api";

export default function RiderStatus() {
    const [status, setStatus] = useState("offline");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/riders/status/");

            setStatus(response.data.availability_status);
        } catch (err) {
            console.error("Failed to fetch rider status:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load rider status."
            );
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async () => {
        if (status === "busy") {
            return;
        }

        const newStatus =
            status === "available"
                ? "offline"
                : "available";

        try {
            setUpdating(true);
            setError("");

            const response = await api.patch(
                "/riders/status/",
                {
                    availability_status: newStatus,
                }
            );

            setStatus(response.data.availability_status);
        } catch (err) {
            console.error("Failed to update rider status:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to update rider status."
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    <span className="text-gray-600">
                        Loading availability...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Availability
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Let customers know whether you're available for
                        deliveries.
                    </p>
                </div>

                <div
                    className={`w-3 h-3 rounded-full ${
                        status === "available"
                            ? "bg-green-500"
                            : status === "busy"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                    }`}
                />
            </div>

            {/* Current status */}
            <div className="mt-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        Current status
                    </p>

                    <p
                        className={`text-xl font-bold mt-1 ${
                            status === "available"
                                ? "text-green-600"
                                : status === "busy"
                                ? "text-yellow-600"
                                : "text-gray-600"
                        }`}
                    >
                        {status === "available"
                            ? "Available"
                            : status === "busy"
                            ? "Busy"
                            : "Offline"}
                    </p>
                </div>

                {/* Toggle button */}
                <button
                    onClick={changeStatus}
                    disabled={updating || status === "busy"}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition ${
                        status === "available"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-600 text-white hover:bg-green-700"
                    } ${
                        updating || status === "busy"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                >
                    {updating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Power className="w-5 h-5" />

                            {status === "available"
                                ? "Go Offline"
                                : status === "busy"
                                ? "Busy"
                                : "Go Available"}
                        </>
                    )}
                </button>
            </div>

            {/* Busy message */}
            {status === "busy" && (
                <div className="mt-5 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        You are currently assigned to an order. Your
                        availability will automatically change when the
                        delivery is completed.
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}