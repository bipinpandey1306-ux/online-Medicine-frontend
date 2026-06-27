import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import MedicineDetail from "@/pages/MedicineDetail";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Prescriptions from "@/pages/Prescriptions";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMedicines from "@/pages/admin/AdminMedicines";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminPrescriptions from "@/pages/admin/AdminPrescriptions";
import AdminLogin from "@/pages/admin/Login";
import CustomerLogin from "@/pages/Login";
import CustomerRegister from "@/pages/Register";
import Account from "@/pages/Account";
import { setAuthTokenGetter } from "@/api-client";
import { LocationProvider } from "@/context/LocationContext";

// Attach either the admin token or customer token to all fetch requests
setAuthTokenGetter(() => localStorage.getItem("admin_token") || localStorage.getItem("customer_token"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/medicines" component={Catalog} />
      <Route path="/medicines/:id" component={MedicineDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/prescriptions" component={Prescriptions} />
      <Route path="/login" component={CustomerLogin} />
      <Route path="/register" component={CustomerRegister} />
      <Route path="/account" component={Account} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/medicines" component={AdminMedicines} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/prescriptions" component={AdminPrescriptions} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

export default App;
