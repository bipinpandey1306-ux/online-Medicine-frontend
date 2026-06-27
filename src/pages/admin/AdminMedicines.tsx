import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListMedicines, useCreateMedicine, useUpdateMedicine, useDeleteMedicine, getListMedicinesQueryKey } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminMedicines() {
  const [search, setSearch] = useState("");
  const { data: medicines, isLoading } = useListMedicines({ search });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();
  const deleteMutation = useDeleteMedicine();

  // Form State
  const [formData, setFormData] = useState({
    name: "", brand: "", category: "", mrp: 0, discountPrice: 0, 
    stock: 0, prescriptionRequired: false, isFeatured: false
  });

  const handleOpenEdit = (medicine: any) => {
    setFormData({
      name: medicine.name, brand: medicine.brand, category: medicine.category,
      mrp: medicine.mrp, discountPrice: medicine.discountPrice, stock: medicine.stock,
      prescriptionRequired: medicine.prescriptionRequired, isFeatured: medicine.isFeatured || false
    });
    setEditingId(medicine.id);
    setIsDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", brand: "", category: "", mrp: 0, discountPrice: 0, stock: 0, prescriptionRequired: false, isFeatured: false });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if(confirm("Are you sure you want to delete this medicine?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          toast({ title: "Medicine updated" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
        }
      });
    } else {
      createMutation.mutate({ data: { ...formData, imageUrl: "https://placehold.co/400x400" } }, {
        onSuccess: () => {
          toast({ title: "Medicine created" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() });
        }
      });
    }
  };

  return (
    <AdminLayout title="Medicine Inventory">
      <div className="bg-white rounded-xl border shadow-sm flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-4 border-b flex justify-between items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search medicines..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/30"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd}><Plus className="h-4 w-4 mr-2" /> Add Medicine</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-medium">Name</label><Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Brand</label><Input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Category</label><Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Stock</label><Input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">MRP (₹)</label><Input type="number" required value={formData.mrp} onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Selling Price (₹)</label><Input type="number" required value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: parseFloat(e.target.value)})} /></div>
                </div>
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.prescriptionRequired} onChange={e => setFormData({...formData, prescriptionRequired: e.target.checked})} className="rounded text-primary focus:ring-primary" /> Rx Required</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="rounded text-primary focus:ring-primary" /> Featured</label>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending || updateMutation.isPending}>Save Medicine</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0">
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : medicines?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No medicines found.</TableCell></TableRow>
              ) : (
                medicines?.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>
                      <div className="font-medium text-primary">{med.name}</div>
                      <div className="text-xs text-muted-foreground">{med.brand}</div>
                    </TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">₹{med.discountPrice}</div>
                      <div className="text-xs text-muted-foreground line-through">₹{med.mrp}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{med.stock}</TableCell>
                    <TableCell className="text-center">
                      {med.prescriptionRequired && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">Rx</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleOpenEdit(med)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(med.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
