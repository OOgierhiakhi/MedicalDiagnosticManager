import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Receipt, Eye, CreditCard, Banknote, Smartphone, FileText, Printer, DollarSign, Clock, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

interface Test {
  id: number;
  name: string;
  code: string;
  price: string;
  categoryId: number;
}

interface ReferralProvider {
  id: number;
  name: string;
}

interface InvoiceItem {
  testId: number;
  name: string;
  price: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  totalAmount: string;
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
  createdByName: string;
  tests: any[];
}

export default function InvoiceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTests, setSelectedTests] = useState<InvoiceItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [referralProviderId, setReferralProviderId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [receivingBankAccountId, setReceivingBankAccountId] = useState<number | null>(null);
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [testSearchTerm, setTestSearchTerm] = useState("");
  const [showNewReferralDialog, setShowNewReferralDialog] = useState(false);
  const [newReferralName, setNewReferralName] = useState("");
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);

  // Query for patients
  const { data: patients } = useQuery({
    queryKey: ["/api/patients", user?.branchId],
    enabled: !!user?.branchId,
  });

  // Query for tests
  const { data: tests } = useQuery({
    queryKey: ["/api/tests", user?.tenantId],
    enabled: !!user?.tenantId,
  });

  // Query for referral providers
  const { data: referralProviders } = useQuery({
    queryKey: ["/api/referral-providers", user?.tenantId],
    enabled: !!user?.tenantId,
  });

  // Query for organization bank accounts
  const { data: organizationBankAccounts } = useQuery({
    queryKey: ["/api/organization-bank-accounts"],
  });

  // Query for invoices with status filter
  const { data: invoices, refetch: refetchInvoices } = useQuery({
    queryKey: ["/api/invoices", user?.branchId, invoiceFilter === "all" ? undefined : invoiceFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        branchId: user?.branchId?.toString() || "",
      });
      if (invoiceFilter !== "all") {
        params.append("status", invoiceFilter);
      }
      const response = await apiRequest("GET", `/api/invoices?${params}`);
      return response.json();
    },
    enabled: !!user?.branchId,
  });

  // Mutation for creating referral providers
  const createReferralProviderMutation = useMutation({
    mutationFn: async (providerData: { name: string; tenantId: number; requiresCommissionSetup: boolean }) => {
      const response = await apiRequest("POST", "/api/referral-providers", providerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral-providers", user?.tenantId] });
      setShowNewReferralDialog(false);
      setNewReferralName("");
      toast({
        title: "Success",
        description: "New referral provider created successfully. Manager will set commission rates.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for creating invoices
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "Invoice created successfully and is ready for payment collection.",
      });
      refetchInvoices();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Mutation for processing payments
  const processPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, paymentData }: { invoiceId: number; paymentData: any }) => {
      const response = await apiRequest("PUT", `/api/invoices/${invoiceId}/pay`, paymentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Payment has been successfully processed and recorded.",
      });
      refetchInvoices();
      setShowPaymentDialog(false);
      setSelectedInvoice(null);
      setPaymentMethod("");
      setPaymentDetails({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handleCreateReferralProvider = () => {
    if (!newReferralName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral provider name",
        variant: "destructive",
      });
      return;
    }

    createReferralProviderMutation.mutate({
      name: newReferralName.trim(),
      tenantId: user?.tenantId!,
      requiresCommissionSetup: true
    });
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedTests([]);
    setDiscountPercentage(0);
    setReferralProviderId(null);
  };

  const handleAddTest = (test: Test) => {
    if (!selectedTests.find(t => t.testId === test.id)) {
      setSelectedTests([...selectedTests, {
        testId: test.id,
        name: test.name,
        price: parseFloat(test.price)
      }]);
    }
  };

  const handleRemoveTest = (testId: number) => {
    setSelectedTests(selectedTests.filter(t => t.testId !== testId));
  };

  const handleCreateReferral = () => {
    if (!newReferralName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral provider name",
        variant: "destructive",
      });
      return;
    }
    createReferralProviderMutation.mutate({
      name: newReferralName.trim(),
      tenantId: user?.tenantId!,
      requiresCommissionSetup: true
    });
  };

  const calculateInvoiceAmounts = () => {
    const subtotal = selectedTests.reduce((sum, test) => sum + test.price, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount;
    
    return {
      subtotal,
      discountAmount,
      totalAmount, // Patient pays this amount
      netAmount: totalAmount // Patient pays the full amount after discount
    };
  };

  const handleCreateInvoice = () => {
    if (!selectedPatient || selectedTests.length === 0) {
      toast({
        title: "Error",
        description: "Please select a patient and at least one test",
        variant: "destructive",
      });
      return;
    }

    const amounts = calculateInvoiceAmounts();
    
    const invoiceData = {
      patientId: selectedPatient.id,
      tenantId: user?.tenantId,
      branchId: user?.branchId,
      tests: selectedTests,
      subtotal: amounts.subtotal,
      discountPercentage,
      discountAmount: amounts.discountAmount,
      totalAmount: amounts.totalAmount,
      netAmount: amounts.netAmount,
      referralProviderId,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const handleProcessPayment = () => {
    if (!selectedInvoice || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please select payment method and fill required details",
        variant: "destructive",
      });
      return;
    }

    // Validate receiving bank account for non-cash payments
    if (paymentMethod !== "cash" && !receivingBankAccountId) {
      toast({
        title: "Error",
        description: "Please select the receiving bank account for non-cash payments",
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      paymentMethod,
      paymentDetails,
      receivingBankAccountId: paymentMethod === "cash" ? null : receivingBankAccountId,
      paidBy: user?.id,
    };

    processPaymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      paymentData,
    });
  };

  const filteredPatients = (patients as Patient[] || []).filter(patient =>
    `${patient.firstName} ${patient.lastName} ${patient.patientId}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTests = (tests as Test[] || []).filter(test =>
    test.name.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
    test.code.toLowerCase().includes(testSearchTerm.toLowerCase())
  );

  const amounts = calculateInvoiceAmounts();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <p className="text-muted-foreground">Two-stage billing: Create invoices and process payments separately</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create an unpaid invoice that can be paid later by the payment cashier
              </DialogDescription>
            </DialogHeader>
            
            {/* Patient Selection */}
            <div className="space-y-4">
              <div>
                <Label>Search and Select Patient</Label>
                <Input
                  placeholder="Search by name or patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                {searchTerm && (
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-2 cursor-pointer hover:bg-gray-50 ${
                          selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setSearchTerm("");
                        }}
                      >
                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {patient.patientId}</div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedPatient && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <div className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                    <div className="text-sm text-gray-500">ID: {selectedPatient.patientId}</div>
                  </div>
                )}
              </div>

              {/* Test Selection */}
              <div>
                <Label>Select Tests</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search tests..."
                    value={testSearchTerm}
                    onChange={(e) => setTestSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {filteredTests.map((test: Test) => (
                      <div
                        key={test.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedTests.some(t => t.testId === test.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleAddTest(test)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{test.name}</div>
                            <div className="text-sm text-gray-500">Code: {test.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₦{parseFloat(test.price).toLocaleString()}</div>
                            {selectedTests.some(t => t.testId === test.id) && (
                              <Badge variant="default" className="text-xs">Added</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Tests */}
              {selectedTests.length > 0 && (
                <div>
                  <Label>Selected Tests</Label>
                  <div className="space-y-2">
                    {selectedTests.map((test) => (
                      <div key={test.testId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{test.name}</span>
                        <div className="flex items-center gap-2">
                          <span>₦{test.price.toLocaleString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTest(test.testId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referral Provider */}
              <div>
                <Label>Referral Provider (Optional)</Label>
                <div className="flex gap-2">
                  <Select value={referralProviderId?.toString() || "none"} onValueChange={(value) => setReferralProviderId(value === "none" ? null : parseInt(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select referral provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(referralProviders as ReferralProvider[] || []).map((provider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewReferralDialog(true)}
                    className="whitespace-nowrap"
                  >
                    Add New
                  </Button>
                </div>
              </div>

              {/* Discount */}
              <div>
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Invoice Summary */}
              {selectedTests.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Invoice Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₦{amounts.subtotal.toLocaleString()}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount ({discountPercentage}%):</span>
                        <span>-₦{amounts.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Patient Pays:</span>
                      <span>₦{amounts.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateInvoice}
                  disabled={!selectedPatient || selectedTests.length === 0 || createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Tabs */}
      <Tabs value={invoiceFilter} onValueChange={(value) => setInvoiceFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid Invoices</TabsTrigger>
          <TabsTrigger value="paid">Paid Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value={invoiceFilter} className="mt-6">
          <div className="grid gap-4">
            {(invoices as Invoice[] || []).map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                        <Badge variant={invoice.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {invoice.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Patient: {invoice.patientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created by: {invoice.createdByName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                      {invoice.paidAt && (
                        <p className="text-sm text-muted-foreground">
                          Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium">
                        ₦{parseFloat(invoice.totalAmount).toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {invoice.paymentStatus === 'unpaid' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentDialog(true);
                            }}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Collect Payment
                          </Button>
                        )}
                        {invoice.paymentStatus === 'paid' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/invoices/${invoice.id}/thermal-receipt`);
                                  if (response.ok) {
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `thermal-receipt-${invoice.invoiceNumber}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                    toast({
                                      title: "Thermal Receipt Downloaded",
                                      description: "POS receipt ready for thermal printer",
                                    });
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Download Failed",
                                    description: "Could not generate thermal receipt",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Printer className="w-4 h-4 mr-1" />
                              POS Receipt
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/invoices/${invoice.id}/receipt`);
                                  if (response.ok) {
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `receipt-${invoice.invoiceNumber}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                    toast({
                                      title: "PDF Receipt Downloaded",
                                      description: "Receipt downloaded successfully",
                                    });
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Download Failed",
                                    description: "Could not generate PDF receipt",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Receipt className="w-4 h-4 mr-1" />
                              PDF Receipt
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceForView(invoice);
                            setShowInvoiceDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Collection Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Process payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span>{selectedInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Due:</span>
                  <span className="font-medium">₦{(() => {
                    console.log('Selected invoice data:', selectedInvoice);
                    const amount = selectedInvoice.totalAmount || selectedInvoice.netAmount || selectedInvoice.total || '0';
                    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                    return isNaN(numAmount) ? '0' : numAmount.toLocaleString();
                  })()}</span>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center">
                      <Banknote className="w-4 h-4 mr-2" />
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Debit/Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Receiving Bank Account for Non-Cash Payments */}
              {paymentMethod && paymentMethod !== "cash" && (
                <div>
                  <Label>Receiving Bank Account</Label>
                  <Select value={receivingBankAccountId?.toString() || ""} onValueChange={(value) => setReceivingBankAccountId(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select receiving account" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationBankAccounts?.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{account.accountName}</span>
                            <span className="text-sm text-gray-500">
                              {account.bankName} - {account.accountNumber}
                              {account.isDefaultReceiving && " (Default)"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payment Details */}
              {paymentMethod === "card" && (
                <div className="space-y-2">
                  <Input
                    placeholder="Card last 4 digits"
                    value={paymentDetails.cardLastFour || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, cardLastFour: e.target.value})}
                  />
                  <Input
                    placeholder="Transaction reference"
                    value={paymentDetails.transactionRef || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, transactionRef: e.target.value})}
                  />
                </div>
              )}

              {paymentMethod === "transfer" && (
                <div className="space-y-2">
                  <Input
                    placeholder="Transfer reference"
                    value={paymentDetails.transferRef || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, transferRef: e.target.value})}
                  />
                  <Input
                    placeholder="Sending bank"
                    value={paymentDetails.sendingBank || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, sendingBank: e.target.value})}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessPayment}
                  disabled={!paymentMethod || processPaymentMutation.isPending}
                >
                  {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Referral Provider Dialog */}
      <Dialog open={showNewReferralDialog} onOpenChange={setShowNewReferralDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Referral Provider</DialogTitle>
            <DialogDescription>
              Create a new referral provider. The manager will be notified to set the commission rate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="referralName">Provider Name</Label>
              <Input
                id="referralName"
                placeholder="Enter referral provider name"
                value={newReferralName}
                onChange={(e) => setNewReferralName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewReferralDialog(false);
                setNewReferralName("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateReferralProvider}
              disabled={createReferralProviderMutation.isPending || !newReferralName.trim()}
            >
              {createReferralProviderMutation.isPending ? "Creating..." : "Create Provider"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information and test breakdown
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoiceForView && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Invoice Number</Label>
                  <p className="text-lg font-bold">{selectedInvoiceForView.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div>
                    <Badge variant={selectedInvoiceForView.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {selectedInvoiceForView.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p>{selectedInvoiceForView.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-semibold">₦{parseFloat(selectedInvoiceForView.totalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{new Date(selectedInvoiceForView.createdAt).toLocaleDateString()} by {selectedInvoiceForView.createdByName}</p>
                </div>
                {selectedInvoiceForView.paidAt && (
                  <div>
                    <Label className="text-sm font-medium">Paid</Label>
                    <p>{new Date(selectedInvoiceForView.paidAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Tests/Services */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Tests/Services</Label>
                {selectedInvoiceForView.tests && selectedInvoiceForView.tests.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInvoiceForView.tests.map((test: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{test.name || `Test ${index + 1}`}</p>
                          {test.testId && <p className="text-sm text-gray-500">Test ID: {test.testId}</p>}
                        </div>
                        <p className="font-semibold">₦{(typeof test.price === 'string' ? parseFloat(test.price) : test.price || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No test details available</p>
                )}
              </div>

              {selectedInvoiceForView.paymentMethod && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p className="capitalize">{selectedInvoiceForView.paymentMethod}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}