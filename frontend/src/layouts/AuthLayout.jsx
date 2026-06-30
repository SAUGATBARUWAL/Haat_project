import React from 'react'
import background from "../assets/auth-bg.png"

{/* the childern are the props that means anything can be passed in childern */}



export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {children}
    </div>
  );
}