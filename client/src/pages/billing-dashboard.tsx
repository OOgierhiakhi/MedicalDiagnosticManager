import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function BillingDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Fetch invoices data
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices", user?.branchId],
    enabled: !!user?.branchId,
  });

  // Fetch payment summary with real-time updates
  const { data: paymentSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["/api/billing/summary", user?.branchId],
    enabled: !!user?.branchId,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0, // Always fetch fresh data
  });

  // Calculate billing metrics from summary endpoint
  const invoicesArray = Array.isArray(invoices) ? invoices : [];
  const totalOutstanding = paymentSummary?.totalOutstanding || 0;
  const collectedToday = paymentSummary?.collectedToday || 0;
  const overdueInvoices = paymentSummary?.overdueInvoices || 0;
  const totalInvoices = paymentSummary?.totalInvoices || invoicesArray.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'unpaid':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Unpaid</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter invoices based on search and status
  const filteredInvoices = invoicesArray.filter((invoice: any) => {
    const matchesSearch = invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage invoices and track payments</p>
        </div>
        <div className="flex gap-3">
          <Link href="/patient-intake">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
          <Link href="/patient-billing">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(collectedToday)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
                <p className="text-2xl font-bold text-orange-600">
                  {overdueInvoices}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalInvoices}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
          <TabsTrigger value="payments">Payment Processing</TabsTrigger>
          <TabsTrigger value="reports">Billing Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>View and manage all patient invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by patient name or invoice number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Invoices Table */}
              <div className="space-y-4">
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-muted-foreground">Loading invoices...</p>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No invoices found</p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice: any) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{invoice.patientName || 'N/A'}</h3>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Invoice #:</span>
                                <p>{invoice.invoiceNumber || invoice.id}</p>
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span>
                                <p className="font-semibold text-foreground">{formatCurrency(invoice.total)}</p>
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>
                                <p>{formatDate(invoice.createdAt)}</p>
                              </div>
                              <div>
                                <span className="font-medium">Payment:</span>
                                <p className="capitalize">{invoice.paymentMethod || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/invoice-management`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {invoice.status === 'unpaid' && (
                              <Link href="/patient-billing">
                                <Button size="sm">
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Payment Processing</CardTitle>
                <CardDescription>Process payments for walk-in patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/patient-billing">
                  <Button className="w-full" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    New Payment Entry
                  </Button>
                </Link>
                <Link href="/patient-intake">
                  <Button variant="outline" className="w-full" size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Invoice & Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Today</CardTitle>
                <CardDescription>Breakdown of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>Cash Payments</span>
                    <span className="font-semibold">{formatCurrency(paymentSummary?.paymentMethods?.cash || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span>POS/Card Payments</span>
                    <span className="font-semibold">{formatCurrency(paymentSummary?.paymentMethods?.pos || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span>Bank Transfers</span>
                    <span className="font-semibold">{formatCurrency(paymentSummary?.paymentMethods?.bankTransfer || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Reports</CardTitle>
                <CardDescription>Generate detailed billing reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/invoice-management">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Invoice Reports
                  </Button>
                </Link>
                <Link href="/daily-transactions">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Daily Transaction Report
                  </Button>
                </Link>
                <Link href="/accounts-receivable">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Accounts Receivable
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>Advanced billing analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/analytics-dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Revenue Analytics
                  </Button>
                </Link>
                <Link href="/accounting-dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Financial Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}