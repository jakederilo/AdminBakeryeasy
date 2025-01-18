import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"; // Ensure correct imports
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Users from "./pages/users/Users";
import Products from "./pages/products/Products";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";

import Product from "./pages/product/Product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthContext"; // Import the AuthProvider
import "./styles/global.scss";
import SignUp from "./pages/signup/Signup";
import React from "react";
import Order from "./pages/order/Order";
import Transaction from "./pages/transaction/Transaction";
import Customer_Reward from "./pages/customer_reward/Customer_Reward";

// Create a query client for React Query
const queryClient = new QueryClient();

// Layout component with Navbar, Menu (sidebar), and Footer
const Layout = () => (
  <div className="main">
    <Navbar />
    <div className="container">
      <div className="menuContainer">
        <Menu /> {/* Sidebar component */}
      </div>
      <div className="contentContainer">
        <Outlet /> {/* Render matched child routes */}
      </div>
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="users" element={<Users />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Order />} />
                <Route path="transaction" element={<Transaction />} />
                <Route path="customer_reward" element={<Customer_Reward />} />
                <Route path="products/:id" element={<Product />} />

                <Route path="admin" element={<div>Admin Page</div>} />
              </Route>
              {/* Public Routes */}
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </React.Suspense>
    </QueryClientProvider>
  );
}

export default App;
