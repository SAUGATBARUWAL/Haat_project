import React from 'react'
import { Search } from 'lucide-react'

const SearchBar = () => {
  return (
    <>
    <div className='relative flex-1 max-w-xl'>
        <Search 
        className='absolute left-5 top-3 -translate-y-0.5 text-gray-500'
        size={20}
        />
        <input
        type="text"
        placeholder="Search products..."
        className="w-full rounded-full pl-12 pr-4 py-2 text-gray-700 bg-white outline-none focus:ring-2 focus:ring-green-300"
        />
    </div>
    </>
  )
}

export default SearchBar