import React from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MedicineCard } from "@/components/medicine/MedicineCard";
import { Button } from "@/components/ui/button";
import { useGetFeaturedMedicines, useListCategories, useListHealthTips } from "@/api-client";
import { FileUp, ShieldCheck, Truck, Clock, Pill, Activity } from "lucide-react";

export default function Home() {
  const { data: featuredMedicines, isLoading: isMedicinesLoading } = useGetFeaturedMedicines();
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const { data: healthTips, isLoading: isTipsLoading } = useListHealthTips();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-white">
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  <span>100% Genuine Medicines</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  Your Trusted <span className="text-secondary">Health Partner</span> Online
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/80">
                  Get authentic medicines delivered to your doorstep. Upload your prescription and let our certified pharmacists handle the rest.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/prescriptions">
                    <Button size="lg" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white border-0 h-14 px-8 rounded-full text-base font-bold shadow-lg shadow-secondary/20">
                      <FileUp className="mr-2 h-5 w-5" /> Upload Prescription
                    </Button>
                  </Link>
                  <Link href="/medicines">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/30 text-white h-14 px-8 rounded-full text-base font-bold backdrop-blur-sm">
                      Order Medicines
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center relative">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl"></div>
                <img 
                  src="/pharmacist.png" 
                  alt="Pharmacist holding medicines" 
                  className="rounded-3xl shadow-2xl object-cover h-[500px] w-full border-4 border-white/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features / Trust Badges */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-16 w-16 rounded-full bg-blue-50 text-primary flex items-center justify-center mb-2">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg">Govt. Licensed</h3>
                <p className="text-sm text-muted-foreground">Certified pharmacy</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-16 w-16 rounded-full bg-green-50 text-secondary flex items-center justify-center mb-2">
                  <Pill className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg">100% Genuine</h3>
                <p className="text-sm text-muted-foreground">Direct from manufacturers</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-16 w-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Activity className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg">Expert Pharmacists</h3>
                <p className="text-sm text-muted-foreground">Prescription verification</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-16 w-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-2">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Safe and secure shipping</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Shop by Category</h2>
                <p className="text-muted-foreground">Browse our wide range of medicines and health products</p>
              </div>
              <Link href="/medicines">
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold">View All</Button>
              </Link>
            </div>
            
            {isCategoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categories?.slice(0, 6)?.map((category) => (
                  <Link key={category.id} href={`/medicines?category=${category.name}`}>
                    <div className="group bg-white border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                      <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        {(!category.icon || (!category.icon.includes("/") && !category.icon.includes("."))) ? (
                          <span className="text-3xl">{category.icon || "📦"}</span>
                        ) : (
                          <img src={category.icon} alt={category.name} className="h-8 w-8 object-contain" />
                        )}
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{category.medicineCount} items</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Medicines */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Handpicked selections at best prices</p>
              </div>
              <Link href="/medicines?featured=true">
                <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold">View All</Button>
              </Link>
            </div>
            
            {isMedicinesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredMedicines?.slice(0, 4)?.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Prescription Banner */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-3xl overflow-hidden relative shadow-xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
              <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 relative z-10">
                <div className="md:w-2/3 space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Have a prescription?</h2>
                  <p className="text-primary-foreground/90 text-lg">
                    Upload your prescription and we will arrange the medicines for you. Our pharmacist will call you to confirm the order.
                  </p>
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">1</div> Upload image or PDF of your prescription</li>
                    <li className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">2</div> Pharmacist verifies and confirms order</li>
                    <li className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">3</div> Medicines delivered to your door</li>
                  </ul>
                  <Link href="/prescriptions">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8 rounded-full mt-4">
                      Upload Now
                    </Button>
                  </Link>
                </div>
                <div className="md:w-1/3 flex justify-center">
                  <img src="/prescription.png" alt="Prescription" className="rounded-xl shadow-2xl border-4 border-white/20 transform rotate-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
