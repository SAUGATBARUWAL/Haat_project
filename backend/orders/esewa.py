import base64
import hashlib
import hmac
import json
from decimal import Decimal, InvalidOperation

import requests

from django.conf import settings


ESEWA_COMPLETE_STATUS = "COMPLETE"


# ==========================================================
# INTERNAL HELPERS
# ==========================================================


def _get_esewa_settings():
    """
    Return the configured eSewa settings.
    """

    return settings.ESEWA_SETTINGS


def _sign(message: str) -> str:
    """
    Generate eSewa HMAC-SHA256 signature.

    eSewa expects:

        Base64(
            HMAC-SHA256(
                message,
                secret_key
            )
        )
    """

    secret_key = _get_esewa_settings()["SECRET_KEY"]

    digest = hmac.new(
        secret_key.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    return base64.b64encode(
        digest
    ).decode("utf-8")


# ==========================================================
# PAYMENT PAYLOAD
# ==========================================================


def build_payment_payload(order):
    """
    Build the payload that the frontend submits to eSewa.

    The amount is always taken from the server-side Order.
    The frontend must never be allowed to choose the amount.
    """

    if not order.transaction_uuid:

        raise ValueError(
            "Order does not have a transaction UUID."
        )

    if order.total_price <= 0:

        raise ValueError(
            "Order total must be greater than zero."
        )

    esewa = _get_esewa_settings()

    amount = format(
        Decimal(order.total_price),
        ".2f",
    )

    tax_amount = "0"
    product_service_charge = "0"
    product_delivery_charge = "0"

    total_amount = amount

    product_code = esewa["PRODUCT_CODE"]

    signed_field_names = (
        "total_amount,"
        "transaction_uuid,"
        "product_code"
    )

    message = (
        f"total_amount={total_amount},"
        f"transaction_uuid={order.transaction_uuid},"
        f"product_code={product_code}"
    )

    signature = _sign(message)

    return {
        "amount": amount,

        "tax_amount": tax_amount,

        "total_amount": total_amount,

        "transaction_uuid": (
            order.transaction_uuid
        ),

        "product_code": product_code,

        "product_service_charge": (
            product_service_charge
        ),

        "product_delivery_charge": (
            product_delivery_charge
        ),

        "success_url": esewa["SUCCESS_URL"],

        "failure_url": esewa["FAILURE_URL"],

        "signed_field_names": (
            signed_field_names
        ),

        "signature": signature,

        # The frontend should POST the above fields
        # to this URL.
        "form_action": esewa["INITIATE_URL"],
    }


# ==========================================================
# CALLBACK DECODING
# ==========================================================


def decode_callback(data_param: str) -> dict:
    """
    Decode eSewa's Base64 encoded callback.

    Returns {} when the callback is malformed.
    """

    if not data_param:

        return {}

    try:

        decoded = base64.b64decode(
            data_param,
            validate=True,
        ).decode("utf-8")

        payload = json.loads(decoded)

        if not isinstance(payload, dict):

            return {}

        return payload

    except (
        ValueError,
        TypeError,
        json.JSONDecodeError,
        UnicodeDecodeError,
        base64.binascii.Error,
    ):

        return {}


# ==========================================================
# CALLBACK SIGNATURE VERIFICATION
# ==========================================================


def verify_callback(payload: dict) -> bool:
    """
    Verify the eSewa callback signature and status.

    This checks:

    1. signed_field_names exists
    2. every signed field exists
    3. signature matches
    4. transaction status is COMPLETE

    It does NOT check which order the callback belongs to.
    Use verify_payment_for_order() for that.
    """

    if not isinstance(payload, dict):

        return False

    signed_field_names = payload.get(
        "signed_field_names",
        "",
    )

    if not isinstance(
        signed_field_names,
        str,
    ):

        return False

    fields = [
        field.strip()
        for field in signed_field_names.split(",")
        if field.strip()
    ]

    if not fields:

        return False

    try:

        message = ",".join(
            f"{field}={payload[field]}"
            for field in fields
        )

    except KeyError:

        return False

    received_signature = payload.get(
        "signature",
        "",
    )

    if not received_signature:

        return False

    expected_signature = _sign(message)

    if not hmac.compare_digest(
        expected_signature,
        str(received_signature),
    ):

        return False

    return (
        str(
            payload.get(
                "status",
                ""
            )
        ).upper()
        == ESEWA_COMPLETE_STATUS
    )


# ==========================================================
# ORDER-SPECIFIC VERIFICATION
# ==========================================================


def verify_payment_for_order(
    payload: dict,
    order,
) -> bool:
    """
    Verify that the callback represents a completed
    payment for this exact HAAT order.
    """

    if not verify_callback(payload):

        return False

    esewa = _get_esewa_settings()

    # ------------------------------------------------------
    # TRANSACTION UUID
    # ------------------------------------------------------

    if payload.get(
        "transaction_uuid"
    ) != order.transaction_uuid:

        return False

    # ------------------------------------------------------
    # PRODUCT CODE
    # ------------------------------------------------------

    if payload.get(
        "product_code"
    ) != esewa["PRODUCT_CODE"]:

        return False

    # ------------------------------------------------------
    # TOTAL AMOUNT
    # ------------------------------------------------------

    try:

        callback_amount = Decimal(
            str(
                payload.get(
                    "total_amount",
                    "",
                )
            )
        )

        order_amount = Decimal(
            str(order.total_price)
        )

    except (
        InvalidOperation,
        TypeError,
        ValueError,
    ):

        return False

    if callback_amount != order_amount:

        return False

    return True


# ==========================================================
# TRANSACTION STATUS CHECK
# ==========================================================


def check_transaction_status(order):
    """
    Ask eSewa directly for the transaction status.

    This is a server-to-server verification.

    The browser callback alone is NOT trusted to mark
    an order as paid.
    """

    if not order.transaction_uuid:

        return {
            "success": False,
            "status": "NOT_FOUND",
            "ref_id": None,
            "data": {},
        }

    esewa = _get_esewa_settings()

    params = {
        "product_code": esewa["PRODUCT_CODE"],

        "total_amount": format(
            Decimal(order.total_price),
            ".2f",
        ),

        "transaction_uuid": (
            order.transaction_uuid
        ),
    }

    try:

        response = requests.get(
            esewa["STATUS_CHECK_URL"],
            params=params,
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException:

        return {
            "success": False,
            "status": "VERIFICATION_ERROR",
            "ref_id": None,
            "data": {},
        }

    except ValueError:

        return {
            "success": False,
            "status": "INVALID_RESPONSE",
            "ref_id": None,
            "data": {},
        }

    if not isinstance(data, dict):

        return {
            "success": False,
            "status": "INVALID_RESPONSE",
            "ref_id": None,
            "data": {},
        }

    # ------------------------------------------------------
    # STATUS
    # ------------------------------------------------------

    status_value = str(
        data.get(
            "status",
            ""
        )
    ).upper()

    # ------------------------------------------------------
    # REFERENCE ID
    # ------------------------------------------------------

    ref_id = (
        data.get("ref_id")
        or data.get("refId")
        or data.get("transaction_code")
        or ""
    )

    # ------------------------------------------------------
    # PRODUCT CODE
    # ------------------------------------------------------

    returned_product_code = (
        data.get("product_code")
        or data.get("scd")
    )

    if (
        returned_product_code
        and returned_product_code
        != esewa["PRODUCT_CODE"]
    ):

        return {
            "success": False,
            "status": "INVALID_PRODUCT_CODE",
            "ref_id": ref_id,
            "data": data,
        }

    # ------------------------------------------------------
    # TRANSACTION UUID
    # ------------------------------------------------------

    returned_uuid = (
        data.get("transaction_uuid")
        or data.get("pid")
    )

    if (
        returned_uuid
        and returned_uuid
        != order.transaction_uuid
    ):

        return {
            "success": False,
            "status": "INVALID_TRANSACTION_UUID",
            "ref_id": ref_id,
            "data": data,
        }

    # ------------------------------------------------------
    # AMOUNT
    # ------------------------------------------------------

    returned_amount = (
        data.get("total_amount")
        if "total_amount" in data
        else data.get("totalAmount")
    )

    try:

        returned_amount = Decimal(
            str(returned_amount)
        )

        order_amount = Decimal(
            str(order.total_price)
        )

    except (
        InvalidOperation,
        TypeError,
        ValueError,
    ):

        return {
            "success": False,
            "status": "INVALID_AMOUNT",
            "ref_id": ref_id,
            "data": data,
        }

    if returned_amount != order_amount:

        return {
            "success": False,
            "status": "INVALID_AMOUNT",
            "ref_id": ref_id,
            "data": data,
        }

    # ------------------------------------------------------
    # FINAL RESULT
    # ------------------------------------------------------

    return {
        "success": (
            status_value
            == ESEWA_COMPLETE_STATUS
        ),

        "status": status_value,

        "ref_id": ref_id,

        "data": data,
    }