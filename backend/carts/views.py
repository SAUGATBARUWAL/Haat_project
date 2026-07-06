import uuid

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from products.models import Product
from .models import Cart, CartItem


def _cart_id(request):
    cart_id = request.session.get("cart_id")
    if not cart_id:
        cart_id = str(uuid.uuid4())
        request.session["cart_id"] = cart_id
    return cart_id


def add_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.user.is_authenticated:
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={"quantity": 1},
        )
        if not created:
            cart_item.quantity += 1
            cart_item.save()

        return JsonResponse({
            "success": True,
            "message": "Product added to cart",
            "quantity": cart_item.quantity,
        })

    cart, _ = Cart.objects.get_or_create(cart_id=_cart_id(request))
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": 1},
    )
    if not created:
        cart_item.quantity += 1
        cart_item.save()

    return JsonResponse({
        "success": True,
        "message": "Product added to cart",
        "quantity": cart_item.quantity,
    })


def remove_cart(request, product_id, cart_item_id):
    product = get_object_or_404(Product, id=product_id)

    if request.user.is_authenticated:
        cart_item = CartItem.objects.filter(user=request.user, product=product, id=cart_item_id).first()
    else:
        cart = Cart.objects.filter(cart_id=_cart_id(request)).first()
        cart_item = CartItem.objects.filter(cart=cart, product=product, id=cart_item_id).first()

    if not cart_item:
        return JsonResponse({"success": False, "message": "Cart item not found"}, status=404)

    if cart_item.quantity > 1:
        cart_item.quantity -= 1
        cart_item.save()
    else:
        cart_item.delete()

    return JsonResponse({"success": True, "message": "Cart updated"})


def remove_cart_item(request, product_id, cart_item_id):
    product = get_object_or_404(Product, id=product_id)

    if request.user.is_authenticated:
        cart_item = CartItem.objects.filter(user=request.user, product=product, id=cart_item_id).first()
    else:
        cart = Cart.objects.filter(cart_id=_cart_id(request)).first()
        cart_item = CartItem.objects.filter(cart=cart, product=product, id=cart_item_id).first()

    if cart_item:
        cart_item.delete()

    return JsonResponse({"success": True, "message": "Cart item removed"})


def cart(request):
    if request.user.is_authenticated:
        items = CartItem.objects.filter(user=request.user, is_active=True)
    else:
        cart = Cart.objects.filter(cart_id=_cart_id(request)).first()
        items = CartItem.objects.filter(cart=cart, is_active=True) if cart else []

    payload = []
    for item in items:
        payload.append({
            "id": item.id,
            "product_id": item.product.id,
            "product_name": item.product.name,
            "price": float(item.product.price),
            "quantity": item.quantity,
            "subtotal": float(item.sub_total()),
        })

    return JsonResponse({"items": payload})


@login_required(login_url="/login/")
def checkout(request):
    if request.user.is_authenticated:
        items = CartItem.objects.filter(user=request.user, is_active=True)
    else:
        cart = Cart.objects.filter(cart_id=_cart_id(request)).first()
        items = CartItem.objects.filter(cart=cart, is_active=True) if cart else []

    total = sum(float(item.product.price) * item.quantity for item in items)
    tax = round(total * 0.02, 2)
    grand_total = round(total + tax, 2)

    return JsonResponse({
        "items": list(items.values("id", "product__name", "quantity")) if items else [],
        "total": total,
        "tax": tax,
        "grand_total": grand_total,
    })