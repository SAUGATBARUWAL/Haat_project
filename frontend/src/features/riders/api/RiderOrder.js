// features/rider/api/riderOrders.js

import api from "../../../utils/api";

/*
|--------------------------------------------------------------------------
| RIDER ORDER API
|--------------------------------------------------------------------------
|
| All rider operations are handled by the orders app.
|
| GET   /api/orders/rider/
| GET   /api/orders/rider/<id>/
| PATCH /api/orders/rider/<id>/status/
|
*/


/*
|--------------------------------------------------------------------------
| Get all orders assigned to the logged-in rider
|--------------------------------------------------------------------------
*/

export async function fetchRiderOrders() {
    try {
        const response = await api.get("/orders/rider/");

        /*
        |------------------------------------------------------------------
        | Django REST Framework pagination
        |------------------------------------------------------------------
        |
        | If pagination is enabled, Django returns:
        |
        | {
        |     count: 1,
        |     next: null,
        |     previous: null,
        |     results: [...]
        | }
        |
        | If pagination is disabled, it returns:
        |
        | [...]
        |
        | This handles both cases.
        |
        */

        return response.data.results || response.data;
    } catch (error) {
        console.error(
            "Failed to fetch rider orders:",
            error.response?.status,
            error.response?.data
        );

        throw new Error(
            error.response?.data?.detail ||
            "Could not load your assigned orders."
        );
    }
}


/*
|--------------------------------------------------------------------------
| Get one assigned order
|--------------------------------------------------------------------------
*/

export async function fetchRiderOrderDetail(orderId) {
    try {
        const response = await api.get(
            `/orders/rider/${orderId}/`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Failed to fetch rider order:",
            error.response?.status,
            error.response?.data
        );

        throw new Error(
            error.response?.data?.detail ||
            "Could not load this order."
        );
    }
}


/*
|--------------------------------------------------------------------------
| Update order delivery status
|--------------------------------------------------------------------------
|
| Supported examples:
|
| {
|     status: "out_for_delivery"
| }
|
| {
|     status: "delivered"
| }
|
| {
|     status: "delivered",
|     cash_received: true
| }
|
*/

export async function updateOrderStatus(
    orderId,
    {
        status,
        cash_received = false,
    }
) {
    try {
        const response = await api.patch(
            `/orders/rider/${orderId}/status/`,
            {
                status,
                cash_received,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Failed to update order status:",
            error.response?.status,
            error.response?.data
        );

        throw new Error(
            error.response?.data?.detail ||
            error.response?.data?.status?.[0] ||
            "Could not update order status."
        );
    }
}


/*
|--------------------------------------------------------------------------
| Get rider availability status
|--------------------------------------------------------------------------
|
| GET /api/riders/status/
|
*/

export async function fetchRiderStatus() {
    try {
        const response = await api.get(
            "/riders/status/"
        );

        return response.data;
    } catch (error) {
        console.error(
            "Failed to fetch rider status:",
            error.response?.status,
            error.response?.data
        );

        throw new Error(
            error.response?.data?.detail ||
            "Could not load rider availability."
        );
    }
}


/*
|--------------------------------------------------------------------------
| Update rider availability status
|--------------------------------------------------------------------------
|
| Allowed rider-controlled statuses:
|
|     available
|     offline
|
| "busy" should be controlled by the backend/order system.
|
| PATCH /api/riders/status/
|
| Request:
|
| {
|     availability_status: "available"
| }
|
*/

export async function updateRiderStatus(
    availability_status
) {
    try {
        const response = await api.patch(
            "/riders/status/",
            {
                availability_status,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Failed to update rider status:",
            error.response?.status,
            error.response?.data
        );

        throw new Error(
            error.response?.data?.detail ||
            error.response?.data?.availability_status?.[0] ||
            "Could not update rider availability."
        );
    }
}