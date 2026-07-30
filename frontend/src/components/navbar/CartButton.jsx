import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const CartButton = () => {
  const { cart, isCustomer } = useCart()
  const count = cart.total_items

  return (
    <Link to='/cart' className='relative hover:text-green-200 transition text-white'>
      <ShoppingCart size={24} />
      {isCustomer && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-1">
          {count}
        </span>
      )}
    </Link>
  )
}

export default CartButton