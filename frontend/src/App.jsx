import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./features/auth/Login";
import SignupChoice from "./features/auth/SignupChoice";
import CustomerSignup from "./features/auth/CustomerSignup";
import SellerSignup from "./features/auth/SellerSignup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<SignupChoice />} />

        <Route
          path="/signup/customer"
          element={<CustomerSignup />}
        />

        <Route
          path="/signup/seller"
          element={<SellerSignup />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;  