import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext' // adjust path to match your project

const WishlistButton = () => {
  const { wishlistIds, isCustomer } = useWishlist()
  const count = wishlistIds.size

  return (
    <Link to='/wishlist' className='relative hover:text-green-200 transition text-white'>
      <Heart size={24} />
      {isCustomer && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-1">
          {count}
        </span>
      )}
    </Link>
  )
}

export default WishlistButton