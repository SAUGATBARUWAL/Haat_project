import React from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const WishlistButton = () => {
  return (
    <Link to='/wishlist' className='relative hover:text-green-200 transition text-white'> 
        <Heart size={24}/>
        {/* Badge */}
        <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-1">
            2
        </span>
    </Link>
  )
}

export default WishlistButton