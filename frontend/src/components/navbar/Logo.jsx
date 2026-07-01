import React from 'react'
import {Store} from 'lucide-react'
import { Link } from 'react-router-dom'
{/* helps to navigate between pages without reloading the website */}
export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 text-3xl font-bold text-white tracking-wide"
    >
      <Store size={32} />
      <span>HAAT</span>
    </Link>
  );
}