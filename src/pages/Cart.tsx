import React from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useGetCart, useRemoveFromCart, useCreateOrder } from "@/api-client";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, MapPin, Phone, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useLocationContext } from "@/context/LocationContext";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { location } = useLocationContext();
  
  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const createOrder = useCreateOrder();
  
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("customer_token");
    const userStr = localStorage.getItem("customer_user");
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        setCustomerName(user.name || "");
        setCustomerPhone(user.phone || "");
        
        if (location?.address) {
          setDeliveryAddress(location.address);
        } else {
          setDeliveryAddress(user.address || "");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      if (location?.address) {
        setDeliveryAddress(location.address);
      }
    }
  }, [location?.address]);

  const handleRemove = (medicineId: number) => {
    removeFromCart.mutate({ medicineId }, {
      onSuccess: () => {
        toast({
          title: "Item removed",
          description: "The item has been removed from your cart.",
        });
      }
    });
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || !cart.items.length) return;
    
    createOrder.mutate(
      {
        data: {
          items: cart.items.map(item => ({ medicineId: item.medicineId, quantity: item.quantity })),
          customerName,
          customerPhone,
          deliveryAddress
        }
      },
      {
        onSuccess: (order) => {
          toast({
            title: "Order Placed Successfully!",
            description: "Your order has been confirmed.",
          });
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Checkout failed",
            description: "There was a problem processing your order. Please try again.",
          });
        }
      }
    );
  };

  const hasPrescriptionItems = cart?.items?.some(item => item.prescriptionRequired) ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Your Cart</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl border animate-pulse"></div>
              ))}
            </div>
            <div className="h-[400px] bg-white rounded-2xl border animate-pulse"></div>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl border shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Looks like you haven't added any medicines to your cart yet. Browse our catalog to find what you need.
            </p>
            <Link href="/medicines">
              <Button size="lg" className="rounded-full px-8">Browse Medicines</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex justify-between items-center text-sm font-medium text-muted-foreground">
                  <span>Product Details</span>
                  <div className="flex items-center gap-12">
                    <span className="w-16 text-center">Quantity</span>
                    <span className="w-24 text-right">Price</span>
                    <span className="w-10"></span>
                  </div>
                </div>
                
                <div className="divide-y divide-border">
                  {cart.items.map((item) => (
                    <div key={item.medicineId} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-20 w-20 bg-muted/50 rounded-xl border flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.medicineName} className="h-full w-full object-contain mix-blend-multiply" />
                          ) : (
                            <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                          )}
                        </div>
                        <div>
                          <Link href={`/medicines/${item.medicineId}`} className="font-bold text-lg hover:text-primary transition-colors block mb-1">
                            {item.medicineName}
                          </Link>
                          {item.prescriptionRequired && (
                            <span className="inline-flex text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              Prescription Required
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                        <div className="w-16 text-center font-medium bg-muted/50 py-1.5 rounded-lg border">
                          {item.quantity}
                        </div>
                        <div className="w-24 text-right font-bold text-lg">
                          ₹{item.price * item.quantity}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(item.medicineId)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {hasPrescriptionItems && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-start gap-4">
                  <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 mb-1">Prescription Required</h4>
                    <p className="text-amber-800 text-sm">
                      Your cart contains medicines that require a valid prescription. You can upload it now or our pharmacist will contact you after order placement.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Checkout Form & Summary */}
            <div className="space-y-6">
              <form onSubmit={handleCheckout} className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
                <h3 className="font-bold text-xl border-b pb-4">Delivery Details</h3>
                
                {!isLoggedIn && (
                  <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-sm font-medium border border-amber-200">
                    Please log in to your customer account to complete checkout and place orders.
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" /> Full Name
                    </label>
                    <Input 
                      required 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)} 
                      placeholder="Enter your name" 
                      disabled={!isLoggedIn}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                    </label>
                    <Input 
                      required 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)} 
                      placeholder="10-digit mobile number" 
                      disabled={!isLoggedIn}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> Delivery Address
                    </label>
                    <textarea 
                      required 
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Complete address with landmark and pincode"
                      disabled={!isLoggedIn}
                    />
                    {location?.address && deliveryAddress !== location.address && (
                      <button
                        type="button"
                        onClick={() => setDeliveryAddress(location.address)}
                        className="mt-1.5 text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="h-3 w-3" /> Use selected location address
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items Total ({cart.items.length} items)</span>
                      <span>₹{cart.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <div className="border-t border-dashed pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-extrabold text-2xl text-primary">₹{cart.totalAmount}</span>
                    </div>
                  </div>
                </div>
                
                {isLoggedIn ? (
                  <Button type="submit" size="lg" className="w-full h-14 rounded-full text-base font-bold shadow-md cursor-pointer bg-primary hover:bg-primary/95 text-white">
                    Place Order <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    size="lg" 
                    onClick={() => setLocation("/login?redirect=/cart")}
                    className="w-full h-14 rounded-full text-base font-bold shadow-md cursor-pointer bg-primary hover:bg-primary/95 text-white"
                  >
                    Login to Place Order <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By placing order, you agree to our Terms and Conditions
                </p>
              </form>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
