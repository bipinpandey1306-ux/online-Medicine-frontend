import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { HeartPulse, ShoppingCart, User, Search, FileText, LayoutDashboard, Menu, X, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@/api-client";
import { useLocationContext } from "@/context/LocationContext";
import { LocationPickerDialog } from "./LocationPickerDialog";

export function Navbar() {
  const { data: cart } = useGetCart();
  const [, setLocation] = useLocation();
  const [customerUser, setCustomerUser] = useState<{ name: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { location } = useLocationContext();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("customer_user");
    if (userStr) {
      try {
        setCustomerUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setCustomerUser(null);
    setLocation("/");
    window.location.reload();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition-transform group-hover:scale-105">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:inline-block">
              Krishna<span className="text-secondary">Pharmacy</span>
            </span>
          </Link>

          {/* Location Selector */}
          <button
            onClick={() => setIsLocationDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted/70 transition-all text-left group cursor-pointer max-w-[140px] sm:max-w-[240px]"
          >
            <MapPin className="h-4.5 w-4.5 text-primary group-hover:animate-bounce shrink-0" />
            <div className="text-left leading-none truncate">
              <span className="text-muted-foreground block text-[9px] uppercase font-extrabold tracking-wider mb-0.5">Deliver to</span>
              <span className="font-bold text-foreground text-xs leading-none flex items-center gap-0.5 truncate">
                {location ? (location.pincode ? `${location.city || 'Location'} ${location.pincode}` : location.city) : "Select Location"}
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </span>
            </div>
          </button>
        </div>

        <div className="hidden md:flex flex-1 items-center max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search for medicines, health products..." 
            className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-muted/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>

        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/medicines" className="hidden md:flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Medicines
          </Link>
          <Link href="/prescriptions" className="hidden md:flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Upload Prescription
          </Link>
          <div className="h-4 w-px bg-border mx-2 hidden md:block"></div>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary cursor-pointer">
              <ShoppingCart className="h-5 w-5" />
              {cart?.items && cart?.items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                  {cart.items.length}
                </span>
              )}
            </Button>
          </Link>
          <div className="hidden md:inline-flex gap-2">
            <Link href="/orders">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary cursor-pointer">
                <FileText className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="h-4 w-px bg-border mx-2 hidden md:block"></div>
          
          <div className="hidden md:inline-flex">
            {customerUser ? (
              <div className="flex items-center gap-2">
                <Link href="/account" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden lg:inline cursor-pointer">
                  Hi, {customerUser.name.split(" ")[0]}
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg border-destructive/20 h-9"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/95 text-white font-bold h-9 text-xs rounded-lg cursor-pointer">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-muted-foreground hover:text-primary cursor-pointer ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>
      </div>

      {/* Mobile Links Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4 shadow-inner">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for medicines..." 
              className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-muted/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          {/* Mobile Location Selector Button */}
          <button 
            onClick={() => { setIsMobileMenuOpen(false); setIsLocationDialogOpen(true); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl bg-muted/40 border border-muted hover:bg-muted/60 transition-all text-left cursor-pointer"
          >
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div className="text-left overflow-hidden">
              <span className="text-muted-foreground block text-[9px] uppercase font-extrabold tracking-wider mb-0.5">Deliver to</span>
              <span className="font-bold text-foreground text-xs leading-none flex items-center gap-0.5 truncate">
                {location ? (location.pincode ? `${location.city || 'Location'} ${location.pincode}` : location.city) : "Select Location"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </span>
            </div>
          </button>

          <div className="flex flex-col gap-2">
            <Link 
              href="/medicines" 
              className="text-sm font-semibold text-muted-foreground hover:text-primary py-2 transition-colors border-b border-muted"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Medicines
            </Link>
            <Link 
              href="/prescriptions" 
              className="text-sm font-semibold text-muted-foreground hover:text-primary py-2 transition-colors border-b border-muted"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload Prescription
            </Link>
            <Link 
              href="/orders" 
              className="text-sm font-semibold text-muted-foreground hover:text-primary py-2 transition-colors border-b border-muted"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Orders
            </Link>
            {customerUser ? (
              <>
                <Link 
                  href="/account" 
                  className="text-sm font-semibold text-muted-foreground hover:text-primary py-2 transition-colors border-b border-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account (Hi, {customerUser.name.split(" ")[0]})
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="text-sm font-bold text-destructive hover:text-destructive/80 py-2 text-left transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-sm font-bold text-primary hover:text-primary/80 py-2 text-left transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Location Picker Dialog */}
      <LocationPickerDialog 
        isOpen={isLocationDialogOpen} 
        onClose={() => setIsLocationDialogOpen(false)} 
      />
    </header>
  );
}

