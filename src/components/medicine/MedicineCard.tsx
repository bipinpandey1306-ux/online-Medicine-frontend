import React from "react";
import { Link } from "wouter";
import { Medicine } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/api-client";
import { useToast } from "@/hooks/use-toast";

export function MedicineCard({ medicine }: { medicine: Medicine }) {
  const addToCart = useAddToCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const discountPercent = Math.round(((medicine.mrp - medicine.discountPrice) / medicine.mrp) * 100);

  return (
    <Link href={`/medicines/${medicine.id}`}>
      <div className="group relative flex flex-col rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
        {medicine.prescriptionRequired && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 gap-1 shadow-sm">
              <ShieldAlert className="h-3 w-3" /> Rx
            </Badge>
          </div>
        )}
        
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-secondary hover:bg-secondary text-white shadow-sm font-bold">
              {discountPercent}% OFF
            </Badge>
          </div>
        )}

        <div className="p-6 flex items-center justify-center bg-white aspect-square w-full border-b overflow-hidden group-hover:bg-gray-50 transition-colors">
          <img 
            src={medicine.imageUrl || "https://placehold.co/400x400/e2e8f0/64748b?text=Medicine"} 
            alt={medicine.name} 
            className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
          />
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
            {medicine.brand}
          </div>
          <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {medicine.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
            {medicine.saltComposition}
          </p>
          
          <div className="mt-auto pt-4 flex items-end justify-between border-t border-border/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-primary">₹{medicine.discountPrice}</span>
                {medicine.mrp > medicine.discountPrice && (
                  <span className="text-sm text-muted-foreground line-through">₹{medicine.mrp}</span>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              className="rounded-full w-9 h-9 p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
