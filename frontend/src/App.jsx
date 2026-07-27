import { Routes, Route } from "react-router-dom";

import Home from "./features/home/Home";

import Login from "./features/auth/Login";
import SignupChoice from "./features/auth/SignupChoice";
import CustomerSignup from "./features/auth/CustomerSignup";
import SellerSignup from "./features/auth/SellerSignup";
import Profile from "./features/profile/Profile";

import SellerDashboard from "./features/seller_dash/SellerDashboard";
import DashboardHome from "./features/seller_dash/DashboardHome";
import MyProducts from "./features/seller_dash/SelProduct";
import AddProduct from "./features/seller_dash/AddProduct";

import Orders from "./features/seller_dash/Orders";
import Analytics from "./features/seller_dash/Analytics";
import SelProduct from "./features/seller_dash/SelProduct";
import SellerProfile from "./features/profile/SellerProfile";

import Products from "./features/products/Products";

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
      <Route path="/products" element={<Products />} />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />

      {/* Seller Dashboard */}
      <Route path="/seller" element={<SellerDashboard />}>

        {/* Seller Dashboard Home */}
        <Route
          path="dashboard"
          element={<DashboardHome />}
        />

        {/* Seller Products */}
        <Route
          path="products"
          element={<SelProduct />}
        />

        {/* Add Product */}
        <Route
          path="products/add"
          element={<AddProduct />}
        />



        {/* Seller Orders */}
        <Route
          path="orders"
          element={<Orders />}
        />

        {/* Seller Analytics */}
        <Route
          path="analytics"
          element={<Analytics />}
        />

      </Route>
      <Route path="/sellers/:id" element={<SellerProfile />} />

    </Routes>
  );
}

export default App;