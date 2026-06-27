import React from "react";
import { useParams, Link } from "wouter";
import { useGetMedicine, useAddToCart, getGetMedicineQueryKey } from "@/api-client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, ShoppingCart, Info, Activity, Package, AlertTriangle, ArrowLeft } from "lucide-react";

export default function MedicineDetail() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  
  const { data: medicine, isLoading } = useGetMedicine(id, { 
    query: { enabled: !!id, queryKey: getGetMedicineQueryKey(id) } 
  });
  
  const addToCart = useAddToCart();
  
  const handleAddToCart = () => {
    if (!medicine) return;
    
    addToCart.mutate(
      { data: { medicineId: medicine.id, quantity: 1 } },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${medicine.name} was added to your cart.`,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="h-[400px] md:h-[600px] bg-muted animate-pulse rounded-2xl"></div>
            <div className="space-y-6">
              <div className="h-10 bg-muted animate-pulse rounded w-3/4"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-1/2"></div>
              <div className="h-20 bg-muted animate-pulse rounded w-full mt-8"></div>
              <div className="h-32 bg-muted animate-pulse rounded w-full mt-8"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Medicine not found</h1>
            <Link href="/medicines">
              <Button>Browse Medicines</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPercent = Math.round(((medicine.mrp - medicine.discountPrice) / medicine.mrp) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/medicines" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to catalog
        </Link>
        
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="p-8 lg:p-12 flex items-center justify-center bg-gray-50/50 border-b lg:border-b-0 lg:border-r">
              <img 
                src={medicine.imageUrl || "https://placehold.co/600x600/e2e8f0/64748b?text=Medicine"} 
                alt={medicine.name} 
                className="w-full max-w-md h-auto object-contain mix-blend-multiply"
              />
            </div>
            
            {/* Details Section */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {medicine.brand}
                  </span>
                  {medicine.prescriptionRequired && (
                    <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 gap-1 font-semibold">
                      <ShieldAlert className="h-3 w-3" /> Prescription Required
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {medicine.category}
                  </Badge>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2 leading-tight">
                  {medicine.name}
                </h1>
                
                {medicine.saltComposition && (
                  <p className="text-lg text-muted-foreground">
                    {medicine.saltComposition}
                  </p>
                )}
              </div>
              
              <div className="p-6 bg-muted/30 rounded-2xl border border-muted mb-8">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-extrabold text-primary">₹{medicine.discountPrice}</span>
                  {medicine.mrp > medicine.discountPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through mb-1">MRP ₹{medicine.mrp}</span>
                      <Badge className="bg-secondary hover:bg-secondary text-white font-bold mb-1">
                        {discountPercent}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
                
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-full h-14 text-base font-bold shadow-md shadow-primary/20"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                  
                  {medicine.prescriptionRequired && (
                    <Link href="/prescriptions" className="flex-1">
                      <Button size="lg" variant="outline" className="w-full rounded-full h-14 text-base font-bold border-2">
                        Upload Prescription
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-white border">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Package className="h-4 w-4" /> Stock Status</span>
                  <span className={medicine.stock > 0 ? "font-bold text-green-600" : "font-bold text-red-500"}>
                    {medicine.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-white border">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Activity className="h-4 w-4" /> Manufacturer</span>
                  <span className="font-bold text-foreground">{medicine.manufacturer || "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs Alternative (Scrollable Sections) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 border shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Product Information
              </h2>
              
              <div className="prose max-w-none text-muted-foreground">
                {medicine.description ? (
                  <p>{medicine.description}</p>
                ) : (
                  <p>No description available for this product.</p>
                )}
              </div>
              
              {medicine.dosage && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 border-l-4 border-primary pl-3">Recommended Dosage</h3>
                  <p className="text-muted-foreground">{medicine.dosage}</p>
                </div>
              )}
              
              {medicine.storageInstructions && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 border-l-4 border-primary pl-3">Storage Instructions</h3>
                  <p className="text-muted-foreground">{medicine.storageInstructions}</p>
                </div>
              )}
            </div>

            {medicine.sideEffects && (
              <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-6 w-6" />
                  Possible Side Effects
                </h2>
                <div className="prose max-w-none text-red-800/80">
                  <p>{medicine.sideEffects}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
              <h3 className="font-bold text-lg mb-4">Why buy from Krishna Pharmacy?</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">✓</div>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground block">100% Genuine</strong> Sourced directly from manufacturers</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">✓</div>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground block">Fast Delivery</strong> Contactless delivery to your doorstep</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">✓</div>
                  <p className="text-sm text-muted-foreground"><strong className="text-foreground block">Secure Payments</strong> Multiple safe payment options</p>
                </li>
              </ul>
            </div>
            
            {medicine.prescriptionRequired && (
              <div className="bg-orange-50 rounded-3xl p-8 border border-orange-200 text-orange-800">
                <ShieldAlert className="h-8 w-8 mb-4 text-orange-600" />
                <h3 className="font-bold text-lg mb-2">Prescription Mandatory</h3>
                <p className="text-sm mb-4">
                  This medicine contains Schedule H drugs. A valid prescription from a registered medical practitioner is required to process this order.
                </p>
                <Link href="/prescriptions">
                  <Button variant="outline" className="w-full bg-white border-orange-300 text-orange-700 hover:bg-orange-100">
                    Upload Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
