import React from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileUp, FileText, CheckCircle2, Clock, XCircle, FileImage } from "lucide-react";
import { useListPrescriptions, useUploadPrescription, getListPrescriptionsQueryKey } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Prescriptions() {
  const [, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const [customerName, setCustomerName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("customer_token");
    const userStr = localStorage.getItem("customer_user");
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCustomerName(user.name || "");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const { data: prescriptions, isLoading, refetch } = useListPrescriptions({
    query: {
      queryKey: getListPrescriptionsQueryKey(),
      enabled: isLoggedIn
    }
  });
  const uploadMutation = useUploadPrescription();
  const { toast } = useToast();

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;
    
    setIsUploading(true);
    
    // Simulate file upload delay
    setTimeout(() => {
      uploadMutation.mutate(
        {
          data: {
            customerName,
            notes,
            fileUrl: `https://example.com/prescription-${Date.now()}.pdf` // Mock URL
          }
        },
        {
          onSuccess: () => {
            toast({
              title: "Prescription Uploaded",
              description: "Our pharmacists will review it shortly.",
            });
            // Reset patient name to user name if logged in
            const userStr = localStorage.getItem("customer_user");
            if (userStr) {
              try {
                setCustomerName(JSON.parse(userStr).name || "");
              } catch (e) {
                setCustomerName("");
              }
            } else {
              setCustomerName("");
            }
            setNotes("");
            refetch();
          },
          onSettled: () => {
            setIsUploading(false);
          }
        }
      );
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1"/> Pending Review</Badge>;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/10">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 max-w-md flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl border shadow-xl p-8 text-center w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto text-primary">
              <FileUp className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">Prescription Upload</h2>
            <p className="text-muted-foreground text-sm mb-8">
              To upload doctor prescriptions and view your verification history, please sign in to your customer account.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setLocation("/login?redirect=/prescriptions")} 
                className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Sign In to Upload
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")} 
                className="w-full h-11 border-border rounded-xl cursor-pointer"
              >
                Back to Homepage
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Prescriptions</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileUp className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Upload New</h2>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-5">
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group relative overflow-hidden">
                  <FileImage className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <p className="text-sm font-medium mb-1">Click to browse or drag file here</p>
                  <p className="text-xs text-muted-foreground">Supported: JPG, PNG, PDF (Max 5MB)</p>
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Patient Name</label>
                  <Input 
                    required 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    placeholder="Name on prescription" 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Additional Notes (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Any specific instructions for the pharmacist"
                  />
                </div>
                
                <Button type="submit" className="w-full h-12" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Submit Prescription"}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Prescriptions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-muted/20">
                <h2 className="text-xl font-bold">Upload History</h2>
              </div>
              
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : !prescriptions || prescriptions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground opacity-50">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">No Prescriptions Yet</h3>
                  <p className="text-muted-foreground text-sm">Upload your first prescription to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">Prescription #{prescription.id}</span>
                            {getStatusBadge(prescription.status)}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Patient: {prescription.customerName || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on {format(new Date(prescription.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">View Document</Button>
                        {prescription.status.toLowerCase() === 'approved' && (
                          <Button size="sm" className="w-full sm:w-auto">Order Medicines</Button>
                        )}
                      </div>
                    </div>
                  ))}
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
