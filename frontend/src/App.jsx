import { Routes, Route } from "react-router-dom";

import Home from "./features/home/Home";

import Login from "./features/auth/Login";
import SignupChoice from "./features/auth/SignupChoice";
import CustomerSignup from "./features/auth/CustomerSignup";
import SellerSignup from "./features/auth/SellerSignup";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupChoice />} />
      <Route
        path="/signup/customer"
        element={<CustomerSignup />}
      />
      <Route
        path="/signup/seller"
        element={<SellerSignup />}
      />

      {/* Placeholder pages */}
      <Route path="/wishlist" element={<h1>Wishlist</h1>} />
      <Route path="/cart" element={<h1>Cart</h1>} />
      <Route path="/products" element={<h1>Products</h1>} />
    </Routes>
  );
}

export default App;