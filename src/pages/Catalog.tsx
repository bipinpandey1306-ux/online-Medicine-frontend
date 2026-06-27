import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MedicineCard } from "@/components/medicine/MedicineCard";
import { useListMedicines, useListCategories } from "@/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  
  const { data: medicines, isLoading } = useListMedicines({ search, category });
  const { data: categories } = useListCategories();

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medicine Catalog</h1>
            <p className="text-muted-foreground mt-1">Find and order your medicines</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, salt, or brand..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-white">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Mobile Categories Selector */}
        <div className="block md:hidden overflow-x-auto whitespace-nowrap pb-3 mb-6 scrollbar-none flex gap-2">
          <button 
            className={`inline-block px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${!category ? 'bg-primary text-white shadow-md scale-105' : 'bg-white border border-border text-muted-foreground'}`}
            onClick={() => setCategory("")}
          >
            All Medicines
          </button>
          {categories?.map((c) => (
            <button 
              key={c.id}
              className={`inline-block px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${category === c.name ? 'bg-primary text-white shadow-md scale-105' : 'bg-white border border-border text-muted-foreground'}`}
              onClick={() => setCategory(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="hidden md:block space-y-6">
            <div className="bg-white p-5 rounded-xl border">
              <h3 className="font-bold mb-4 text-lg">Categories</h3>
              <div className="space-y-2">
                <button 
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                  onClick={() => setCategory("")}
                >
                  All Medicines
                </button>
                {categories?.map((c) => (
                  <button 
                    key={c.id}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c.name ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                    onClick={() => setCategory(c.name)}
                  >
                    {c.name}
                    <span className="float-right text-xs opacity-60">{c.medicineCount}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border">
              <h3 className="font-bold mb-4 text-lg">Prescription</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  No Prescription Required
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  Prescription Required
                </label>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[380px] bg-white border border-border/50 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : medicines?.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2">No medicines found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any medicines matching your search. Try checking for typos or searching with different keywords.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => {setSearch(""); setCategory("")}}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {medicines?.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
