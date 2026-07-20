import { useState } from "react";

function QuantitySelector() {
    const [quantity, setQuantity] = useState(1);

    const increase = () => {
        setQuantity(quantity + 1);
    };

    const decrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <div className="flex items-center gap-4">

            <span className="font-medium text-gray-700">
                Quantity
            </span>

            <div className="flex items-center border rounded-lg overflow-hidden">

                <button
                    onClick={decrease}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                >
                    −
                </button>

                <span className="px-6 py-2">
                    {quantity}
                </span>

                <button
                    onClick={increase}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                >
                    +
                </button>

            </div>

        </div>
    );
}

export default QuantitySelector;