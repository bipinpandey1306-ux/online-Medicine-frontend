import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  User as UserIcon, 
  Wallet, 
  Package, 
  MapPin, 
  FileText, 
  Calendar, 
  Users, 
  Heart, 
  HelpCircle, 
  Shield, 
  Info, 
  LogOut, 
  Edit3, 
  ArrowRight, 
  Plus, 
  CheckCircle,
  Clock,
  Sparkles,
  Camera,
  Trash2
} from "lucide-react";
import { useListOrders } from "@/api-client";
import { format } from "date-fns";

interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender?: string;
  profileCompletion?: number;
}

export default function Account() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<CustomerUser | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    const userStr = localStorage.getItem("customer_user");
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        setName(parsedUser.name || "");
        setPhone(parsedUser.phone || "");
        setEmail(parsedUser.email || "");
        setGender(parsedUser.gender || "Male");
        setAddress(parsedUser.address || "");
      } catch (e) {
        console.error(e);
      }
    } else {
      setLocation("/login?redirect=/account");
    }
  }, [setLocation]);

  // Fetch orders (only if logged in)
  const { data: orders, isLoading: isOrdersLoading } = useListOrders({
    query: {
      queryKey: ["listOrders"],
      enabled: isLoggedIn
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    setLocation("/");
    window.location.reload();
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("customer_token")}`
        },
        body: JSON.stringify({ name, phone, email, gender, address })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      localStorage.setItem("customer_user", JSON.stringify(data.user));
      setUser(data.user);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile details have been successfully updated.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "An error occurred while saving your changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sidebar Menu Items
  const menuItems = [
    { id: "profile", label: "My Profile", icon: UserIcon },
    { id: "wallet", label: "My Wallet", icon: Wallet },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "My Addresses", icon: MapPin },
    { id: "health", label: "Health Records", icon: FileText },
    { id: "subscriptions", label: "My Subscriptions", icon: Calendar },
    { id: "family", label: "Family Members", icon: Users },
    { id: "saved", label: "Saved for later", icon: Heart },
    { id: "help", label: "Help & Support", icon: HelpCircle },
    { id: "legal", label: "Legal Information", icon: Shield },
    { id: "about", label: "About Us", icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
              
              <div className="relative w-20 h-20 mx-auto mb-4 group">
                <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
                  {name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <h2 className="font-bold text-lg text-foreground truncate">{user.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>
              
              {/* Profile Completion Ring */}
              <div className="mt-5 pt-5 border-t border-dashed">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span>Profile Completion</span>
                  <span className="text-primary">{user.profileCompletion ?? 83}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500" 
                    style={{ width: `${user.profileCompletion ?? 83}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Edit button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setActiveTab("profile"); setIsEditing(true); }}
                className="mt-4 w-full border border-border hover:bg-muted text-xs font-bold rounded-xl cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            </div>

            {/* Premium Membership Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded bg-amber-500 text-slate-950">
                  <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Krishna First</span>
              </div>
              
              <h3 className="font-extrabold text-sm mb-1 leading-snug">Get Krishna First Membership</h3>
              <p className="text-[11px] text-slate-300 mb-4">Cashbacks, Free delivery, Extra discount & more</p>
              
              <button className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group/btn cursor-pointer">
                Explore Membership <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>

            {/* Mobile Tab Selector */}
            <div className="block lg:hidden bg-white rounded-2xl border border-border p-4 shadow-sm">
              <label htmlFor="tab-select" className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Select Section</label>
              <select
                id="tab-select"
                value={activeTab}
                onChange={(e) => { setActiveTab(e.target.value); setIsEditing(false); }}
                className="w-full h-11 px-3 bg-muted/50 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {menuItems.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Sidebar Navigation (Desktop only) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-border shadow-sm overflow-hidden py-2">
              <nav className="space-y-0.5">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsEditing(false); }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer border-l-2 ${
                        isActive 
                          ? "bg-primary/5 text-primary border-primary font-bold" 
                          : "text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
                
                <div className="h-px bg-border my-2 mx-4"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors text-destructive hover:bg-destructive/5 cursor-pointer font-bold border-l-2 border-transparent"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </nav>
            </div>
            
          </div>

          {/* Main Workspace Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-border shadow-sm min-h-[600px] overflow-hidden flex flex-col">
              
              {/* Profile Tab View */}
              {activeTab === "profile" && (
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Personal Details</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">View and update your personal information</p>
                      </div>
                      {!isEditing && (
                        <Button 
                          onClick={() => setIsEditing(true)} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 cursor-pointer font-bold text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      )}
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                          {isEditing ? (
                            <Input 
                              required 
                              value={name} 
                              onChange={e => setName(e.target.value)} 
                              className="rounded-xl bg-white border-border" 
                            />
                          ) : (
                            <p className="text-sm font-semibold text-foreground bg-muted/30 px-4 py-3 rounded-xl border border-border/40">{user.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Gender</label>
                          {isEditing ? (
                            <div className="flex gap-4 pt-1.5">
                              {["Male", "Female", "Other"].map(g => (
                                <label key={g} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="gender" 
                                    value={g} 
                                    checked={gender === g}
                                    onChange={() => setGender(g)}
                                    className="accent-primary w-4 h-4 cursor-pointer"
                                  />
                                  {g}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-foreground bg-muted/30 px-4 py-3 rounded-xl border border-border/40">{user.gender || "Not Specified"}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Mobile Number</label>
                          {isEditing ? (
                            <Input 
                              required 
                              value={phone} 
                              onChange={e => setPhone(e.target.value)} 
                              className="rounded-xl bg-white border-border" 
                            />
                          ) : (
                            <p className="text-sm font-semibold text-foreground bg-muted/30 px-4 py-3 rounded-xl border border-border/40">+91- {user.phone}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
                          {isEditing ? (
                            <Input 
                              required 
                              type="email"
                              value={email} 
                              onChange={e => setEmail(e.target.value)} 
                              className="rounded-xl bg-white border-border" 
                            />
                          ) : (
                            <p className="text-sm font-semibold text-foreground bg-muted/30 px-4 py-3 rounded-xl border border-border/40">{user.email}</p>
                          )}
                        </div>

                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Residential Address</label>
                        {isEditing ? (
                          <textarea 
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="flex min-h-[100px] w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                            placeholder="Full address with Landmark"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-foreground bg-muted/30 px-4 py-3 rounded-xl border border-border/40 min-h-[80px]">
                            {user.address || "No address added yet."}
                          </p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 justify-end pt-4 border-t">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                              setIsEditing(false);
                              setName(user.name);
                              setPhone(user.phone);
                              setEmail(user.email);
                              setGender(user.gender || "Male");
                              setAddress(user.address);
                            }}
                            className="rounded-xl border border-border hover:bg-muted text-xs font-bold h-11 px-5 cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-md text-xs cursor-pointer"
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                  
                  {!isEditing && (
                    <div className="p-4 bg-muted/20 border border-dashed rounded-2xl flex items-start gap-3 mt-8">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground block mb-0.5">Need a membership boost?</span>
                        Complete your medical profile verification or add a secondary contact number to reach 100% profile score and unlock unique cashback rates.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Tab View */}
              {activeTab === "wallet" && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">My Wallet</h2>
                  
                  <div className="bg-gradient-to-tr from-primary/10 via-white to-primary/5 border border-primary/20 rounded-3xl p-6 text-center max-w-sm mx-auto mb-8 shadow-sm">
                    <Wallet className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">Available Balance</p>
                    <p className="text-4xl font-extrabold text-primary mt-1">₹250.00</p>
                    <Button className="mt-5 w-full rounded-2xl h-11 bg-primary text-white font-bold text-xs shadow-md cursor-pointer">
                      + Add Funds
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground mb-4">Transaction History</h3>
                    <div className="border border-border rounded-2xl divide-y divide-border overflow-hidden bg-muted/5">
                      <div className="p-4 flex justify-between items-center bg-white">
                        <div>
                          <p className="text-sm font-bold text-foreground">Welcome Cashback</p>
                          <p className="text-xs text-muted-foreground">Credited on registration</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">+ ₹250.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab View */}
              {activeTab === "orders" && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">My Orders</h2>
                  
                  {isOrdersLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl"></div>
                      ))}
                    </div>
                  ) : !orders || orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
                      <Button onClick={() => setLocation("/medicines")} className="mt-4 bg-primary text-white font-bold rounded-xl text-xs h-10 px-5">
                        Shop Medicines
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div 
                          key={order.id} 
                          onClick={() => setLocation(`/orders/${order.id}`)}
                          className="bg-white rounded-2xl border border-border shadow-xs p-5 hover:border-primary/30 transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <div className="flex gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">Order #{order.id}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  order.status.toLowerCase() === 'delivered'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Placed on {format(new Date(order.createdAt), "MMM d, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}: {order.items.map(i => i.medicineName).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="font-extrabold text-primary text-sm">₹{order.totalAmount}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab View */}
              {activeTab === "addresses" && (
                <div className="p-8">
                  <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-foreground">Saved Addresses</h2>
                    <Button variant="outline" size="sm" className="rounded-xl text-primary font-bold text-xs h-9 px-4 cursor-pointer border-primary/20 hover:bg-primary/5">
                      <Plus className="w-4 h-4 mr-1.5" /> Add Address
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Home</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">{user.name}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{address || "No address details"}</p>
                      <p className="text-xs text-muted-foreground mt-2">Phone: {phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Records View */}
              {activeTab === "health" && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Health Records</h2>
                  <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/5">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-base text-foreground mb-1">No Prescriptions Uploaded</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">Upload doctor prescriptions to quickly order restricted medicines and view clinical reviews.</p>
                    <Button onClick={() => setLocation("/prescriptions")} className="bg-primary text-white font-bold rounded-xl text-xs h-10 px-5 shadow-sm cursor-pointer">
                      Upload Prescription
                    </Button>
                  </div>
                </div>
              )}

              {/* My Subscriptions View */}
              {activeTab === "subscriptions" && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">My Subscriptions</h2>
                  <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/5">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-base text-foreground mb-1">No Active Refills</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">Subscribe to monthly medicine refills and get extra discounts on recurring orders.</p>
                  </div>
                </div>
              )}

              {/* Family Members View */}
              {activeTab === "family" && (
                <div className="p-8">
                  <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-foreground">Family Members</h2>
                    <Button variant="outline" size="sm" className="rounded-xl text-primary font-bold text-xs h-9 px-4 cursor-pointer border-primary/20 hover:bg-primary/5">
                      <Plus className="w-4 h-4 mr-1.5" /> Add Member
                    </Button>
                  </div>
                  
                  <div className="p-6 border border-dashed rounded-2xl text-center bg-muted/5">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground">Add family profiles to easily order medications for parents, spouse, or kids.</p>
                  </div>
                </div>
              )}

              {/* Saved View */}
              {activeTab === "saved" && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Saved for later</h2>
                  <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/5">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-base text-foreground mb-1">Your wishlist is empty</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">Save products here to easily checkout or buy them when back in stock.</p>
                    <Button onClick={() => setLocation("/medicines")} className="bg-primary text-white font-bold rounded-xl text-xs h-10 px-5 shadow-sm">
                      Browse Medicines
                    </Button>
                  </div>
                </div>
              )}

              {/* Help & Support View */}
              {activeTab === "help" && (
                <div className="p-8 space-y-6">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Help & Support</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-2xl p-5">
                      <h3 className="font-bold text-sm mb-1.5">Order Inquiries</h3>
                      <p className="text-xs text-muted-foreground mb-4">Facing issues with delivery, tracking, or refunds? Raise a support ticket.</p>
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl h-9">Raise Ticket</Button>
                    </div>
                    <div className="border rounded-2xl p-5">
                      <h3 className="font-bold text-sm mb-1.5">Call Pharmacist</h3>
                      <p className="text-xs text-muted-foreground mb-4">Want to consult a registered pharmacist regarding side effects or dosage?</p>
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl h-9">Call 1800-KRISHNA</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Information View */}
              {activeTab === "legal" && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Legal Information</h2>
                  <div className="prose prose-sm text-xs text-muted-foreground space-y-4 max-w-none">
                    <h3 className="font-bold text-sm text-foreground">Terms and Conditions</h3>
                    <p>Welcome to Krishna Pharmacy. By placing orders or registering on this platform, you agree to comply with our Terms of Use, Privacy Policy, and drug-dispensation rules under the Drugs and Cosmetics Act of India.</p>
                    <h3 className="font-bold text-sm text-foreground">Prescription Verification</h3>
                    <p>All Schedule H and H1 medicines ordered on this platform require valid doctor prescriptions. Orders are verified and dispatched under the supervision of registered pharmacists.</p>
                  </div>
                </div>
              )}

              {/* About Us View */}
              {activeTab === "about" && (
                <div className="p-8 space-y-4">
                  <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">About Us</h2>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-2">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-primary">Krishna Pharmacy</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Krishna Pharmacy is India's leading digital pharmacy dedicated to providing safe, reliable, and genuine medications to your doorstep. We emphasize professional pharmacist review, transparent pricing, and rapid delivery.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
