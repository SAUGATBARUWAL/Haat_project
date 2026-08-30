import api from "../../../utils/api";

/*
|--------------------------------------------------------------------------
| eSewa API
|--------------------------------------------------------------------------
| Handles communication between React and our Django backend.
|
| React NEVER sends the payment amount directly.
| Django gets the amount from the Order.
|--------------------------------------------------------------------------
*/

/**
 * Start eSewa payment for an existing order.
 *
 * Django returns the signed payment payload.
 *
 * The returned payload is then submitted to eSewa
 * by EsewaPayment.jsx using a normal HTML POST form.
 */
export async function initiateEsewaPayment(orderId) {
    const response = await api.post(
        `/orders/${orderId}/esewa/initiate/`
    );

    return response.data;
}