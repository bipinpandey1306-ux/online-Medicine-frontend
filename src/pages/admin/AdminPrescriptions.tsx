import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListPrescriptions, useVerifyPrescription, getListPrescriptionsQueryKey } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminPrescriptions() {
  const { data: prescriptions, isLoading } = useListPrescriptions();
  const verifyMutation = useVerifyPrescription();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleVerify = (id: number, status: string) => {
    verifyMutation.mutate({ id, data: { status, notes: `Reviewed by Pharmacist` } }, {
      onSuccess: () => {
        toast({ title: `Prescription ${status}` });
        queryClient.invalidateQueries({ queryKey: getListPrescriptionsQueryKey() });
      }
    });
  };

  return (
    <AdminLayout title="Prescription Verification">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-64 bg-white rounded-xl border animate-pulse"></div>)
        ) : prescriptions?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border shadow-sm">
            <p className="text-muted-foreground">No prescriptions pending review.</p>
          </div>
        ) : (
          prescriptions?.map((rx) => (
            <div key={rx.id} className="bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b flex justify-between items-start bg-muted/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">Rx #{rx.id}</span>
                    {rx.status.toLowerCase() === 'pending' ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Review</Badge>
                    ) : rx.status.toLowerCase() === 'approved' ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Approved</Badge>
                    ) : (
                      <Badge variant="destructive">Rejected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{format(new Date(rx.createdAt), "MMM dd, yyyy h:mm a")}</p>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Patient Name</p>
                  <p className="font-medium">{rx.customerName}</p>
                </div>
                
                {rx.notes && (
                  <div className="mb-4 bg-muted/30 p-3 rounded-lg border text-sm">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Notes:</p>
                    <p>{rx.notes}</p>
                  </div>
                )}

                <div className="mt-auto pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 bg-muted/20">
                    <FileText className="h-4 w-4 mr-2" /> View File
                  </Button>
                </div>
              </div>
              
              {rx.status.toLowerCase() === 'pending' && (
                <div className="p-3 bg-gray-50 border-t flex gap-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => handleVerify(rx.id, 'Approved')}
                    disabled={verifyMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleVerify(rx.id, 'Rejected')}
                    disabled={verifyMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
