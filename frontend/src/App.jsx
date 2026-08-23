import { Routes, Route } from "react-router-dom";

// ============================================================
// HOME
// ============================================================

import Home from "./features/home/Home";

// ============================================================
// AUTHENTICATION
// ============================================================

import Login from "./features/auth/Login";
import SignupChoice from "./features/auth/SignupChoice";
import CustomerSignup from "./features/auth/CustomerSignup";
import SellerSignup from "./features/auth/SellerSignup";

// ============================================================
// PROFILE
// ============================================================

import Profile from "./features/profile/Profile";
import SellerPublicProfile from "./features/profile/SellerPublicProfile";

// ============================================================
// PRODUCTS
// ============================================================

import Products from "./features/products/Products";
import ProductDetail from "./components/card/ProductDetail";

// ============================================================
// CUSTOMER
// ============================================================

import Wishlist from "./features/wishlist/Wishlist";
import Cart from "./features/cart/Cart";
import Orders from "./features/orders/Orders";
import OrderDetail from "./features/orders/OrderDetail";

// ============================================================
// SELLER DASHBOARD
// ============================================================

import SellerDashboard from "./features/seller_dash/SellerDashboard";
import DashboardHome from "./features/seller_dash/DashboardHome";
import SelProduct from "./features/seller_dash/SelProduct";
import AddProduct from "./features/seller_dash/AddProduct";
import SellerOrders from "./features/seller_dash/Orders";
import Analytics from "./features/seller_dash/Analytics";

// ============================================================
// APP
// ============================================================

function App() {
    return (
        <Routes>

            {/* ==================================================
                PUBLIC
            ================================================== */}

            {/* Home */}
            <Route
                path="/"
                element={<Home />}
            />

            {/* All products */}
            <Route
                path="/products"
                element={<Products />}
            />

            {/* Individual product */}
            <Route
                path="/products/:id"
                element={<ProductDetail />}
            />

            {/* Public seller profile */}
            <Route
                path="/sellers/:id"
                element={<SellerPublicProfile />}
            />


            {/* ==================================================
                AUTHENTICATION
            ================================================== */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/signup"
                element={<SignupChoice />}
            />

            <Route
                path="/signup/customer"
                element={<CustomerSignup />}
            />

            <Route
                path="/signup/seller"
                element={<SellerSignup />}
            />


            {/* ==================================================
                CUSTOMER PROFILE
            ================================================== */}

            <Route
                path="/profile"
                element={<Profile />}
            />


            {/* ==================================================
                CUSTOMER
            ================================================== */}

            <Route
                path="/wishlist"
                element={<Wishlist />}
            />

            <Route
                path="/cart"
                element={<Cart />}
            />

            <Route
                path="/orders"
                element={<Orders />}
            />

            <Route
                path="/orders/:id"
                element={<OrderDetail />}
            />


            {/* ==================================================
                SELLER DASHBOARD
            ================================================== */}

            <Route
                path="/seller"
                element={<SellerDashboard />}
            >
                <Route
                    path="dashboard"
                    element={<DashboardHome />}
                />

                <Route
                    path="products"
                    element={<SelProduct />}
                />

                <Route
                    path="products/add"
                    element={<AddProduct />}
                />

                <Route
                    path="orders"
                    element={<SellerOrders />}
                />

                <Route
                    path="analytics"
                    element={<Analytics />}
                />
            </Route>


            {/* ==================================================
                RIDER
            ================================================== */}

            {/*
            <Route
                path="/rider"
                element={<RiderDashboard />}
            >
                <Route
                    path="orders"
                    element={<RiderOrders />}
                />
            </Route>
            */}


            {/* ==================================================
                ADMIN
            ================================================== */}

            {/*
            <Route
                path="/admin"
                element={<AdminDashboard />}
            >
                <Route
                    path="orders"
                    element={<AdminOrders />}
                />

                <Route
                    path="riders"
                    element={<AdminRiders />}
                />
            </Route>
            */}

        </Routes>
    );
}

export default App;