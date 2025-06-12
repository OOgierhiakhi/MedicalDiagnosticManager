import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Search, Edit, Eye, Calendar, Phone, Mail, MapPin, FileText, Plus, Minus, Receipt, CreditCard, Banknote, Printer } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceItem {
  id: number;
  name: string;
  category: string;
  defaultPrice: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PatientBill {
  patientId: number;
  patientName: string;
  services: ServiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  staffId: number;
  receivingBankAccountId?: number | null;
}

export default function PatientBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedBankAccount, setSelectedBankAccount] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [lastReceiptNumber, setLastReceiptNumber] = useState<string>("");
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [workflowStep, setWorkflowStep] = useState<"billing" | "payment">("billing");
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);
  const [showThermalPrintDialog, setShowThermalPrintDialog] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] = useState('58mm');
  const [thermalPrintInvoice, setThermalPrintInvoice] = useState<any>(null);

  // Service master list with different pricing tiers
  const serviceMasterList = [
    // Laboratory Services
    { id: 1, name: "Complete Blood Count (CBC)", category: "Laboratory", defaultPrice: 8000 },
    { id: 2, name: "Blood Chemistry Analysis", category: "Laboratory", defaultPrice: 15000 },
    { id: 3, name: "Lipid Profile", category: "Laboratory", defaultPrice: 12000 },
    { id: 4, name: "Liver Function Test", category: "Laboratory", defaultPrice: 18000 },
    { id: 5, name: "Kidney Function Test", category: "Laboratory", defaultPrice: 16000 },
    { id: 6, name: "Thyroid Function Test", category: "Laboratory", defaultPrice: 22000 },
    { id: 7, name: "HbA1c (Diabetes)", category: "Laboratory", defaultPrice: 9500 },
    { id: 8, name: "Malaria Parasite Test", category: "Laboratory", defaultPrice: 3000 },
    { id: 9, name: "Hepatitis B & C Screening", category: "Laboratory", defaultPrice: 14000 },
    { id: 10, name: "HIV Rapid Test", category: "Laboratory", defaultPrice: 5000 },
    
    // Imaging Services
    { id: 11, name: "Chest X-Ray", category: "Imaging", defaultPrice: 12000 },
    { id: 12, name: "Abdominal Ultrasound", category: "Imaging", defaultPrice: 20000 },
    { id: 13, name: "Pelvic Ultrasound", category: "Imaging", defaultPrice: 18000 },
    { id: 14, name: "Obstetric Ultrasound", category: "Imaging", defaultPrice: 25000 },
    { id: 15, name: "ECG (Electrocardiogram)", category: "Imaging", defaultPrice: 10000 },
    { id: 16, name: "Echocardiogram", category: "Imaging", defaultPrice: 35000 },
    { id: 17, name: "CT Scan Head", category: "Imaging", defaultPrice: 85000 },
    { id: 18, name: "CT Scan Abdomen", category: "Imaging", defaultPrice: 95000 },
    { id: 19, name: "MRI Brain", category: "Imaging", defaultPrice: 150000 },
    { id: 20, name: "Mammography", category: "Imaging", defaultPrice: 45000 }
  ];

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients", user?.branchId],
    enabled: !!user?.branchId,
  });

  // Fetch organization bank accounts for non-cash payments
  const { data: organizationBankAccounts = [] } = useQuery({
    queryKey: ["/api/organization-bank-accounts"],
  });

  // Fetch patient's unpaid invoices when patient is selected
  const { data: unpaidInvoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: [`/api/invoices/patient/${selectedPatient?.id}/unpaid`],
    enabled: !!selectedPatient?.id,
  });

  // Fetch patient's scheduled tests that haven't been invoiced yet
  const { data: scheduledTests = [] } = useQuery({
    queryKey: [`/api/patient-tests`, selectedPatient?.id, 'scheduled'],
    queryFn: async () => {
      if (!selectedPatient?.id) return [];
      const response = await fetch(`/api/patient-tests?patientId=${selectedPatient.id}&status=scheduled`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch scheduled tests');
      return response.json();
    },
    enabled: !!selectedPatient?.id,
  });

  // Handle URL parameters for patient pre-selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    const patientName = urlParams.get('patientName');
    
    if (patientId && patientName && patients.length > 0) {
      const patient = patients.find((p: any) => p.id === parseInt(patientId));
      if (patient) {
        setSelectedPatient(patient);
        toast({
          title: "Patient Selected",
          description: `Ready to process payment for ${decodeURIComponent(patientName)}`,
        });
      }
    }
  }, [patients, toast]);

  // Auto-select the latest unpaid invoice or load scheduled tests when patient is selected
  useEffect(() => {
    if (selectedPatient && unpaidInvoices.length > 0 && !selectedInvoice) {
      // Default to the most recent unpaid invoice
      const latestInvoice = unpaidInvoices[unpaidInvoices.length - 1];
      setSelectedInvoice(latestInvoice);
      setShowServiceSelection(false); // Don't show service selection by default
    } else if (selectedPatient && unpaidInvoices.length === 0 && scheduledTests.length > 0) {
      // No unpaid invoices but has scheduled tests - automatically populate services
      // Remove duplicates by creating a Map with testId as key
      const uniqueTests = new Map();
      scheduledTests.forEach((test: any) => {
        if (!uniqueTests.has(test.testId)) {
          uniqueTests.set(test.testId, test);
        }
      });
      
      const serviceItems = Array.from(uniqueTests.values()).map((test: any) => {
        const price = parseFloat(test.testPrice) || 0;
        return {
          id: test.testId,
          name: test.testName,
          category: test.category || 'Laboratory',
          defaultPrice: price,
          quantity: 1,
          unitPrice: price,
          total: price
        };
      });
      
      // Only update if the services have actually changed
      if (JSON.stringify(serviceItems) !== JSON.stringify(selectedServices)) {
        setSelectedServices(serviceItems);
      }
      setShowServiceSelection(false);
      setSelectedInvoice(null);
    } else if (selectedPatient && unpaidInvoices.length === 0 && scheduledTests.length === 0) {
      // No unpaid invoices and no scheduled tests, allow service selection for new invoice
      setShowServiceSelection(true);
      setSelectedInvoice(null);
      setSelectedServices([]);
    }
  }, [selectedPatient, unpaidInvoices, scheduledTests, selectedInvoice]);

  // Add service to bill
  const addService = (service: any) => {
    const existingService = selectedServices.find(s => s.id === service.id);
    if (existingService) {
      updateServiceQuantity(service.id, existingService.quantity + 1);
    } else {
      const price = parseFloat(service.defaultPrice) || 0;
      const newService: ServiceItem = {
        ...service,
        quantity: 1,
        unitPrice: price,
        total: price
      };
      setSelectedServices([...selectedServices, newService]);
    }
  };

  // Update service quantity
  const updateServiceQuantity = (serviceId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeService(serviceId);
      return;
    }
    setSelectedServices(services => 
      services.map(service => 
        service.id === serviceId 
          ? { ...service, quantity: newQuantity, total: parseFloat(service.unitPrice.toString()) * newQuantity }
          : service
      )
    );
  };

  // Update service unit price (override capability)
  const updateServicePrice = (serviceId: number, newPrice: number) => {
    const price = parseFloat(newPrice.toString()) || 0;
    setSelectedServices(services => 
      services.map(service => 
        service.id === serviceId 
          ? { ...service, unitPrice: price, total: price * service.quantity }
          : service
      )
    );
  };

  // Remove service from bill
  const removeService = (serviceId: number) => {
    setSelectedServices(services => services.filter(s => s.id !== serviceId));
  };

  // Fetch organization settings for VAT configuration
  const { data: orgSettings } = useQuery({
    queryKey: ["/api/organization-settings", user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) return null;
      const response = await apiRequest("GET", `/api/organization-settings/${user.tenantId}`);
      return response.json();
    },
    enabled: !!user?.tenantId
  });

  // Calculate totals with dynamic VAT - ensure all values are numbers
  const subtotal = selectedServices.reduce((sum, service) => {
    const serviceTotal = typeof service.total === 'string' ? parseFloat(service.total) || 0 : service.total || 0;
    return sum + serviceTotal;
  }, 0);
  const vatRate = orgSettings?.vatEnabled ? parseFloat(orgSettings.vatRate || "0") / 100 : 0;
  const tax = subtotal * vatRate;
  const discount = 0; // Can be implemented later
  const totalAmount = subtotal + tax - discount;

  // Create invoice without payment
  const createInvoiceMutation = useMutation({
    mutationFn: async (billData: PatientBill) => {
      const response = await apiRequest("POST", "/api/create-invoice", {
        ...billData,
        tenantId: user?.tenantId,
        branchId: user?.branchId,
        timestamp: new Date().toISOString(),
        staffInfo: {
          id: user?.id,
          username: user?.username,
          department: "Billing"
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Create Invoice Response:", data);
      // Extract the actual invoice object from the response
      const invoiceData = data.invoice || data;
      console.log("Invoice Data Extracted:", invoiceData);
      setCurrentInvoice(invoiceData);
      setWorkflowStep("payment");
      toast({
        title: "Invoice Created",
        description: `Invoice #${data.invoiceNumber} created. Please proceed to payment.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/patient/${selectedPatient?.id}/unpaid`] });
    },
    onError: () => {
      toast({
        title: "Invoice Creation Failed",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process payment mutation for new invoices
  const processPaymentMutation = useMutation({
    mutationFn: async (billData: PatientBill) => {
      const response = await apiRequest("POST", "/api/patient-billing", {
        ...billData,
        tenantId: user?.tenantId,
        branchId: user?.branchId,
        timestamp: new Date().toISOString(),
        staffInfo: {
          id: user?.id,
          username: user?.username,
          department: "Billing"
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Store receipt data for printing
      setLastReceiptNumber(data.receiptNumber);
      setReceiptData({
        receiptNumber: data.receiptNumber,
        patient: selectedPatient,
        services: selectedServices,
        subtotal,
        tax,
        totalAmount,
        paymentMethod,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Payment Processed",
        description: `Receipt #${data.receiptNumber} generated successfully`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowReceiptDialog(true)}
          >
            Print Receipt
          </Button>
        ),
      });
      
      // Reset form
      setSelectedServices([]);
      setSelectedPatient(null);
      setPaymentMethod("cash");
      setSelectedBankAccount(null);
      setIsProcessingPayment(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/patient/${selectedPatient?.id}/unpaid`] });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    },
  });

  // Payment processing mutation for existing invoices
  const payExistingInvoiceMutation = useMutation({
    mutationFn: async (paymentData: { 
      invoiceId: number; 
      paymentMethod: string; 
      receivingBankAccountId: number | null 
    }) => {
      const response = await apiRequest("POST", `/api/invoices/${paymentData.invoiceId}/payment`, {
        paymentMethod: paymentData.paymentMethod,
        receivingBankAccountId: paymentData.receivingBankAccountId
      });
      return response.json(); // Parse the JSON response
    },
    onSuccess: (data, variables) => {
      // Use the invoice data from the mutation variables since the payment was successful
      const invoiceUsed = currentInvoice || selectedInvoice;
      
      // Show interactive payment success dialog instead of passive toast
      setPaymentSuccessData({
        receiptNumber: data.receiptNumber || `RCP-${Date.now()}`,
        invoiceNumber: invoiceUsed?.invoiceNumber,
        amount: invoiceUsed?.totalAmount || "0",
        paymentMethod: paymentMethod,
        invoiceId: variables.invoiceId // Use the actual invoice ID from the mutation
      });
      setShowPaymentSuccessDialog(true);
      
      // Reset state
      setPaymentMethod("cash");
      setSelectedBankAccount(null);
      setIsProcessingPayment(false);
      setSelectedInvoice(null);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/patient/${selectedPatient?.id}/unpaid`] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed", 
        description: error.message || "Failed to process invoice payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    },
  });

  // Handle creating invoice without payment
  const handleCreateInvoice = async () => {
    if (!selectedPatient || selectedServices.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a patient and at least one service.",
        variant: "destructive",
      });
      return;
    }

    const billData: PatientBill = {
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      services: selectedServices,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod: "pending", // Mark as pending payment
      staffId: user?.id || 0,
      receivingBankAccountId: null
    };

    createInvoiceMutation.mutate(billData);
  };

  // Handle thermal printing with paper size selection
  const handleThermalPrint = (invoice: any) => {
    setThermalPrintInvoice(invoice);
    setShowThermalPrintDialog(true);
  };

  const downloadThermalReceipt = async (paperSize: string) => {
    if (!thermalPrintInvoice) return;
    
    try {
      const response = await fetch(`/api/thermal-receipt/${thermalPrintInvoice.id}?paperSize=${paperSize}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thermal-${paperSize}-receipt-${thermalPrintInvoice.invoiceNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Thermal Receipt Downloaded",
          description: `${paperSize} POS receipt ready for thermal printer`,
        });
        setShowThermalPrintDialog(false);
      } else {
        const errorText = await response.text();
        toast({
          title: "Download Failed",
          description: `Could not generate thermal receipt: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate thermal receipt",
        variant: "destructive",
      });
    }
  };

  // Handle payment for current invoice
  const handlePayCurrentInvoice = async () => {
    const invoiceToUse = currentInvoice || selectedInvoice;
    
    console.log("Payment Debug - Current Invoice:", currentInvoice);
    console.log("Payment Debug - Selected Invoice:", selectedInvoice);
    console.log("Payment Debug - Invoice to Use:", invoiceToUse);
    
    if (!invoiceToUse || !invoiceToUse.id) {
      toast({
        title: "No Invoice Selected",
        description: "Please select an invoice to pay.",
        variant: "destructive",
      });
      return;
    }

    // Validate bank account selection for non-cash payments
    if (paymentMethod !== "cash" && !selectedBankAccount) {
      toast({
        title: "Bank Account Required",
        description: "Please select a diagnostic center bank account for non-cash payments.",
        variant: "destructive",
      });
      return;
    }

    console.log("Payment Debug - Invoice ID:", invoiceToUse.id);
    setIsProcessingPayment(true);
    payExistingInvoiceMutation.mutate({
      invoiceId: Number(invoiceToUse.id), // Ensure it's a number
      paymentMethod,
      receivingBankAccountId: paymentMethod === "cash" ? null : selectedBankAccount
    });
  };

  const handleProcessPayment = async () => {
    if (!selectedPatient || selectedServices.length === 0) {
      toast({
        title: "Incomplete Information",
        description: "Please select a patient and add services before processing payment.",
        variant: "destructive",
      });
      return;
    }

    // Validate bank account selection for non-cash payments
    if (paymentMethod !== "cash" && !selectedBankAccount) {
      toast({
        title: "Bank Account Required",
        description: "Please select a diagnostic center bank account for non-cash payments.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    const billData: PatientBill = {
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      services: selectedServices,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      staffId: user?.id || 0,
      receivingBankAccountId: paymentMethod === "cash" ? null : selectedBankAccount
    };

    processPaymentMutation.mutate(billData);
  };

  // Handle payment for existing invoices
  const handlePayExistingInvoice = async () => {
    if (!selectedInvoice) {
      toast({
        title: "No Invoice Selected",
        description: "Please select an invoice to pay.",
        variant: "destructive",
      });
      return;
    }

    // Validate bank account selection for non-cash payments
    if (paymentMethod !== "cash" && !selectedBankAccount) {
      toast({
        title: "Bank Account Required",
        description: "Please select a diagnostic center bank account for non-cash payments.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    payExistingInvoiceMutation.mutate({
      invoiceId: selectedInvoice.id,
      paymentMethod,
      receivingBankAccountId: paymentMethod === "cash" ? null : selectedBankAccount
    });
  };

  const filteredServices = serviceMasterList.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Billing</h1>
        <Badge variant="secondary">Walk-in Service</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Selection & Services */}
        <div className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPatient?.id?.toString() || ""} onValueChange={(value) => {
                const patient = patients.find((p: any) => p.id.toString() === value);
                setSelectedPatient(patient);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName} - {patient.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatient && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p><strong>Patient:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p><strong>ID:</strong> {selectedPatient.patientId}</p>
                  <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unpaid Invoices or Service Selection */}
          {selectedPatient && !loadingInvoices && unpaidInvoices.length > 0 && !showServiceSelection ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Unpaid Invoices
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowServiceSelection(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unpaidInvoices.map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedInvoice?.id === invoice.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium">Services:</p>
                            <div className="text-sm text-muted-foreground">
                              {Array.isArray(invoice.tests) ? 
                                invoice.tests.map((test: any, idx: number) => (
                                  <span key={idx}>
                                    {test.testName || test.name || test.description || 'Service'}
                                    {idx < invoice.tests.length - 1 ? ', ' : ''}
                                  </span>
                                )) : 
                                'Services listed in invoice'
                              }
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">₦{parseFloat(invoice.totalAmount).toLocaleString()}</p>
                          <Badge variant="destructive" className="mt-1">Unpaid</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : showServiceSelection ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Service Master List
                  {selectedPatient && unpaidInvoices.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowServiceSelection(false)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Unpaid Invoices
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₦{service.defaultPrice.toLocaleString()}</span>
                        <Button size="sm" onClick={() => addService(service)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Please select a patient to view invoices or create new bills
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bill & Payment */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedInvoice ? 'Invoice Details' : 'Selected Services'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInvoice ? (
                /* Display read-only invoice details */
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">Invoice #{selectedInvoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/invoices/${selectedInvoice.id}/print`);
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `unpaid-invoice-${selectedInvoice.invoiceNumber}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                                
                                toast({
                                  title: "Invoice Downloaded",
                                  description: "Unpaid invoice with watermark has been generated.",
                                });
                              }
                            } catch (error) {
                              toast({
                                title: "Print Failed",
                                description: "Could not generate invoice for printing.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Print Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleThermalPrint(selectedInvoice)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          POS Print
                        </Button>
                        <Badge variant="destructive">Unpaid</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium mb-2">Services:</p>
                        <div className="space-y-2">
                          {Array.isArray(selectedInvoice.tests) ? 
                            selectedInvoice.tests.map((test: any, idx: number) => (
                              <div key={idx} className="flex justify-between p-2 bg-background rounded border">
                                <span>{test.testName || test.name || test.description || 'Service'}</span>
                                <span className="font-medium">
                                  ₦{test.price ? parseFloat(test.price).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            )) : 
                            <p className="text-muted-foreground">Service details in invoice</p>
                          }
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₦{parseFloat(selectedInvoice.subtotal || '0').toLocaleString()}</span>
                        </div>
                        {selectedInvoice.discountAmount && parseFloat(selectedInvoice.discountAmount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-₦{parseFloat(selectedInvoice.discountAmount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
                          <span>Total Amount:</span>
                          <span>₦{parseFloat(selectedInvoice.totalAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedServices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {selectedPatient ? 
                    (unpaidInvoices.length > 0 ? 
                      'Select an unpaid invoice to proceed with payment' : 
                      'No services selected'
                    ) : 
                    'Select a patient first'
                  }
                </p>
              ) : (
                /* Display editable services for new invoices */
                <div className="space-y-4">
                  {selectedServices.map((service, index) => (
                    <div key={`service-${service.id}-${index}`} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeService(service.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) => updateServiceQuantity(service.id, parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price (₦)</Label>
                          <Input
                            type="number"
                            value={service.unitPrice}
                            onChange={(e) => updateServicePrice(service.id, parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Total (₦)</Label>
                          <Input
                            value={(typeof service.total === 'string' ? parseFloat(service.total) || 0 : service.total || 0).toLocaleString()}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInvoice ? (
                /* Payment summary for existing invoice */
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Invoice Amount:</span>
                    <span>₦{parseFloat(selectedInvoice.totalAmount).toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Amount to Pay:</span>
                    <span>₦{parseFloat(selectedInvoice.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              ) : selectedServices.length > 0 ? (
                /* Bill summary for new services */
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT ({orgSettings?.vatEnabled ? `${orgSettings.vatRate}%` : '0%'}):</span>
                    <span>₦{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>₦{discount.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No invoice or services selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Payment Type</Label>
                <Select value={paymentMethod} onValueChange={(value) => {
                  setPaymentMethod(value);
                  setSelectedBankAccount(null); // Reset bank selection when payment method changes
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash Payment
                      </div>
                    </SelectItem>
                    <SelectItem value="pos">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        POS/Card Payment
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Account Selection for Non-Cash Payments - Only show during payment phase */}
              {paymentMethod !== "cash" && workflowStep === "payment" && (
                <div>
                  <Label>Diagnostic Center Bank Account *</Label>
                  <Select 
                    value={selectedBankAccount?.toString() || ""} 
                    onValueChange={(value) => setSelectedBankAccount(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select receiving bank account" />
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the diagnostic center account that will receive this payment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Buttons */}
          {workflowStep === "billing" ? (
            <div className="space-y-3">
              {/* Create Invoice Button - First Step */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleCreateInvoice}
                disabled={
                  !selectedPatient || 
                  selectedServices.length === 0 ||
                  createInvoiceMutation.isPending
                }
              >
                {createInvoiceMutation.isPending ? "Creating Invoice..." : 
                 `Create Invoice - ₦${totalAmount.toLocaleString()}`
                }
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current Invoice Info */}
              {currentInvoice && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="font-semibold">Invoice Created</p>
                      <p className="text-lg font-mono">{currentInvoice.invoiceNumber}</p>
                      <p className="text-muted-foreground">Amount: ₦{currentInvoice.totalAmount?.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Pay Invoice Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handlePayCurrentInvoice}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing Payment..." : 
                 `Pay Invoice - ₦${(currentInvoice?.totalAmount || selectedInvoice?.totalAmount || 0).toLocaleString()}`
                }
              </Button>
              
              {/* Back to Billing Button */}
              <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => {
                  setWorkflowStep("billing");
                  setCurrentInvoice(null);
                  setSelectedServices([]);
                }}
              >
                Create New Invoice
              </Button>
            </div>
          )}

          {/* Existing Invoice Payment */}
          {selectedInvoice && workflowStep === "billing" && (
            <Button
              size="lg"
              className="w-full mt-3"
              onClick={handlePayExistingInvoice}
              disabled={isProcessingPayment}
              variant="secondary"
            >
              {isProcessingPayment ? "Processing..." : 
               `Pay Existing Invoice - ₦${parseFloat(selectedInvoice.totalAmount).toLocaleString()}`
              }
            </Button>
          )}
        </div>
      </div>

      {/* Receipt Printing Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-6 p-6 bg-white">
              {/* Receipt Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">Orient Medical Diagnostic Centre</h2>
                <p className="text-sm text-gray-600">Payment Receipt</p>
                <p className="text-lg font-mono">{receiptData.receiptNumber}</p>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Patient Details:</p>
                  <p>{receiptData.patient?.firstName} {receiptData.patient?.lastName}</p>
                  <p>ID: {receiptData.patient?.patientId}</p>
                  <p>Phone: {receiptData.patient?.phoneNumber}</p>
                </div>
                <div>
                  <p className="font-semibold">Payment Details:</p>
                  <p>Date: {new Date(receiptData.timestamp).toLocaleDateString()}</p>
                  <p>Method: {receiptData.paymentMethod?.toUpperCase()}</p>
                  <p>Staff: {user?.username}</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="font-semibold mb-2">Services:</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receiptData.services?.map((service: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.quantity}</TableCell>
                        <TableCell>₦{service.unitPrice?.toLocaleString()}</TableCell>
                        <TableCell>₦{service.total?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₦{receiptData.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₦{receiptData.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Paid:</span>
                  <span>₦{receiptData.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Receipt Copies */}
              <div className="border-t pt-4">
                <p className="font-semibold mb-2">Receipt Copies:</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Patient Copy</span>
                    <Badge variant="outline">Original</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Cashier Copy</span>
                    <Badge variant="outline">Duplicate</Badge>
                  </div>
                  {receiptData.services?.map((service: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{service.category} Department Copy</span>
                      <Badge variant="outline">Service Copy</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    if (confirm("Print all receipt copies? This will print the patient copy, cashier copy, and service department copies.")) {
                      window.print();
                    }
                  }} 
                  className="flex-1"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Print All Copies
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReceiptDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <AlertDialog open={showPaymentSuccessDialog} onOpenChange={setShowPaymentSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Processed Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Payment has been successfully processed and recorded.</p>
                <div className="bg-green-50 p-3 rounded border">
                  <div className="space-y-1 text-sm">
                    <div><strong>Receipt Number:</strong> {paymentSuccessData?.receiptNumber}</div>
                    <div><strong>Invoice:</strong> {paymentSuccessData?.invoiceNumber}</div>
                    <div><strong>Amount:</strong> ₦{parseFloat(paymentSuccessData?.amount || "0").toLocaleString()}</div>
                    <div><strong>Payment Method:</strong> {paymentSuccessData?.paymentMethod?.toUpperCase()}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Would you like to print the receipt? Multiple copies will be generated:
                  Patient Copy, Cashier Copy, and Service Department Copy.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPaymentSuccessDialog(false);
              setPaymentSuccessData(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                try {
                  if (paymentSuccessData?.invoiceId) {
                    const response = await fetch(`/api/invoices/${paymentSuccessData.invoiceId}/receipt`);
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `receipt-${paymentSuccessData.receiptNumber}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      toast({
                        title: "Receipt Printed",
                        description: "Receipt with multiple copies has been generated and downloaded.",
                      });
                    }
                  }
                } catch (error) {
                  toast({
                    title: "Print Failed",
                    description: "Could not generate receipt for printing.",
                    variant: "destructive",
                  });
                }
                setShowPaymentSuccessDialog(false);
                setPaymentSuccessData(null);
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Thermal Printer Paper Size Selection Dialog */}
      <AlertDialog open={showThermalPrintDialog} onOpenChange={setShowThermalPrintDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              POS Thermal Printer Settings
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select your thermal printer paper size for optimal receipt formatting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <Label>Paper Size</Label>
              <Select value={selectedPaperSize} onValueChange={setSelectedPaperSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">
                    <div className="flex flex-col">
                      <span className="font-medium">58mm (2.3")</span>
                      <span className="text-xs text-muted-foreground">Standard POS receipt - 32 characters wide</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="57mm">
                    <div className="flex flex-col">
                      <span className="font-medium">57mm (2.25")</span>
                      <span className="text-xs text-muted-foreground">Compact format - 32 characters wide</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="76mm">
                    <div className="flex flex-col">
                      <span className="font-medium">76mm (3")</span>
                      <span className="text-xs text-muted-foreground">Medium format - 42 characters wide</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="80mm">
                    <div className="flex flex-col">
                      <span className="font-medium">80mm (3.15")</span>
                      <span className="text-xs text-muted-foreground">Wide format - 48 characters wide</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="110mm">
                    <div className="flex flex-col">
                      <span className="font-medium">110mm (4.3")</span>
                      <span className="text-xs text-muted-foreground">Extra wide format - 64 characters wide</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {thermalPrintInvoice && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">Invoice: {thermalPrintInvoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: ₦{parseFloat(thermalPrintInvoice.totalAmount || '0').toLocaleString()}
                </p>
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => downloadThermalReceipt(selectedPaperSize)}
              className="bg-primary hover:bg-primary/90"
            >
              <Printer className="w-4 h-4 mr-2" />
              Download {selectedPaperSize} Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}