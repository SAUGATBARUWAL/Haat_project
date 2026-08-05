import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CheckoutModal from "./CheckoutModal";
import { Trash2, Minus, Plus } from "lucide-react";

export default function Cart() {
  const { cart, loaded, updateQuantity, removeItem, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!loaded) {
    return <p className="text-center text-gray-500 py-16">Loading your cart...</p>;
  }

  if (cart.items.length === 0) {
    return <p className="text-center text-gray-500 py-16">Your cart is empty.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Cart</h1>
        <button
          onClick={() => clearCart()}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const product = item.product_detail;
          const image = product.image;
          const outOfStock = item.quantity > product.stock;

          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 flex gap-4 items-center"
            >
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Rs. {product.price}</p>

                {outOfStock && (
                  <p className="text-xs text-red-600 mt-1">
                    Only {product.stock} left in stock — reduce quantity.
                  </p>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 border border-gray-300 rounded-md disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                    className="p-1 border border-gray-300 rounded-md disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-4 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="font-semibold shrink-0">Rs. {item.subtotal}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6 flex items-center justify-between">
        <span className="text-lg font-medium">Total ({cart.total_items} items)</span>
        <span className="text-2xl font-bold text-green-700">Rs. {cart.total_price}</span>
      </div>

      <button
        onClick={() => setShowCheckout(true)}
        className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium"
      >
        Checkout
      </button>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </div>
  );
}
