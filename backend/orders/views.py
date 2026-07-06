import datetime
import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from carts.models import CartItem
from products.models import Product
from .models import Order, OrderProduct, Payment


@login_required(login_url="/login/")
def place_order(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Use POST"}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "message": "Login required"}, status=401)

    cart_items = CartItem.objects.filter(user=request.user, is_active=True)
    if not cart_items.exists():
        return JsonResponse({"success": False, "message": "Cart is empty"}, status=400)

    if request.body:
        data = json.loads(request.body.decode("utf-8"))
    else:
        data = request.POST.dict()

    total = sum(float(item.product.price) * item.quantity for item in cart_items)
    tax = round(total * 0.02, 2)
    grand_total = round(total + tax, 2)

    order = Order.objects.create(
        user=request.user,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        phone=data.get("phone", ""),
        email=data.get("email", request.user.email),
        address_line_1=data.get("address_line_1", ""),
        address_line_2=data.get("address_line_2", ""),
        country=data.get("country", ""),
        state=data.get("state", ""),
        city=data.get("city", ""),
        order_note=data.get("order_note", ""),
        order_total=grand_total,
        tax=tax,
        ip=request.META.get("REMOTE_ADDR", ""),
        is_ordered=True,
    )

    order_number = datetime.date.today().strftime("%Y%m%d") + str(order.id)
    order.order_number = order_number
    order.save(update_fields=["order_number"])

    for item in cart_items:
        OrderProduct.objects.create(
            order=order,
            user=request.user,
            product=item.product,
            quantity=item.quantity,
            product_price=float(item.product.price),
            ordered=True,
        )
        product = Product.objects.get(id=item.product.id)
        product.stock = max(0, product.stock - item.quantity)
        product.save(update_fields=["stock"])

    cart_items.delete()

    return JsonResponse({
        "success": True,
        "message": "Order placed successfully",
        "order_number": order.order_number,
        "grand_total": grand_total,
    })


@login_required(login_url="/login/")
def payments(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Use POST"}, status=405)

    data = json.loads(request.body.decode("utf-8"))
    order = Order.objects.get(user=request.user, order_number=data.get("order_number"))

    payment = Payment.objects.create(
        user=request.user,
        payment_id=data.get("payment_id", "manual"),
        payment_method=data.get("payment_method", "cod"),
        amount_paid=str(order.order_total),
        status="Completed",
    )

    order.payment = payment
    order.is_ordered = True
    order.save(update_fields=["payment", "is_ordered"])

    return JsonResponse({
        "success": True,
        "message": "Payment recorded",
        "order_number": order.order_number,
    })


def order_complete(request):
    order_number = request.GET.get("order_number")
    if not order_number:
        return JsonResponse({"success": False, "message": "Missing order number"}, status=400)

    order = Order.objects.filter(order_number=order_number, is_ordered=True).first()
    if not order:
        return JsonResponse({"success": False, "message": "Order not found"}, status=404)

    ordered_products = OrderProduct.objects.filter(order=order)

    return JsonResponse({
        "success": True,
        "order_number": order.order_number,
        "grand_total": order.order_total,
        "items": [
            {
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": item.product_price,
            }
            for item in ordered_products
        ],
    })