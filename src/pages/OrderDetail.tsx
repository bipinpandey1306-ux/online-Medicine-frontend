import React from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetOrder, getGetOrderQueryKey } from "@/api-client";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, Clock, Package, Truck, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OrderDetail() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  
  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) }
  });

  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
  
  const getStatusIndex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return -1;
    }
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="h-[600px] bg-white rounded-2xl border animate-pulse"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to orders
        </Link>
        
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8 bg-primary/5 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Order #{order.id}</h1>
              <p className="text-muted-foreground text-sm">
                Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-muted-foreground text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-extrabold text-primary">₹{order.totalAmount}</p>
            </div>
          </div>
          
          {/* Status Tracker */}
          <div className="p-6 md:p-10 border-b">
            <h3 className="font-bold text-lg mb-8">Order Status</h3>
            <div className="relative">
              <div className="absolute top-5 left-6 right-6 h-1 bg-muted rounded-full"></div>
              <div 
                className="absolute top-5 left-6 h-1 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStatusIndex / (statuses.length - 1)) * 100)}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {statuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-white mb-3 shadow-sm z-10 transition-colors ${isCompleted ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        {index === 0 && <Clock className="h-4 w-4" />}
                        {index === 1 && <Package className="h-4 w-4" />}
                        {index === 2 && <Truck className="h-4 w-4" />}
                        {index === 3 && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <span className={`text-sm font-medium ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Items */}
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r">
              <h3 className="font-bold text-lg mb-6">Items in this order</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.medicineId} className="flex justify-between items-center p-3 rounded-xl border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-white rounded-lg border flex items-center justify-center font-bold text-muted-foreground">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold">{item.medicineName}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      </div>
                    </div>
                    <p className="font-bold">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Delivery Details */}
            <div className="p-6 md:p-8 bg-gray-50/50">
              <h3 className="font-bold text-lg mb-6">Delivery Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                  <div className="flex items-start gap-2 bg-white p-4 rounded-xl border">
                    <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{order.deliveryAddress}</p>
                  </div>
                </div>
                {order.prescriptionId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prescription</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Prescription Provided (ID: {order.prescriptionId})
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
