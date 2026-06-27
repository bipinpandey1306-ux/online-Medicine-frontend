import React from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListOrders, getListOrdersQueryKey } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  const [, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const { data: orders, isLoading } = useListOrders({
    query: {
      queryKey: getListOrdersQueryKey(),
      enabled: isLoggedIn
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 max-w-md flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl border shadow-xl p-8 text-center w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto text-primary">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">Your Orders</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Please sign in to your customer account to view your purchase and order history.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setLocation("/login?redirect=/orders")} 
                className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Sign In to View
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")} 
                className="w-full h-11 border-border rounded-xl cursor-pointer"
              >
                Back to Homepage
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border animate-pulse"></div>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-3xl border shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-8">You haven't placed any orders yet.</p>
            <Link href="/medicines">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg">Order #{order.id}</span>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-bold text-xl text-primary">₹{order.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}: {order.items.map(i => i.medicineName).join(', ')}
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                      View Details <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
