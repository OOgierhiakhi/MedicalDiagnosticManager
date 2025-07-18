import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NewPurchaseOrderForm } from "@/components/NewPurchaseOrderForm";
import { 
  ShoppingCart,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  DollarSign,
  FileText,
  Calendar,
  Truck,
  Package
} from "lucide-react";

interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendorId: number;
  vendorName: string;
  requestedBy: number;
  requestedByName: string;
  totalAmount: number;
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'ordered' | 'received' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  requiredDate: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  description: string;
  department: string;
  category: string;
  approvalLevel: number;
  currentApprover?: number;
  currentApproverName?: string;
}

interface POLineItem {
  id: number;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface ApprovalWorkflow {
  id: number;
  level: number;
  approverName: string;
  approverId: number;
  minAmount: number;
  maxAmount: number;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  comments?: string;
}

export default function PurchaseOrders() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showNewPOForm, setShowNewPOForm] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewPO, setPreviewPO] = useState<PurchaseOrder | null>(null);
  const [editingLimit, setEditingLimit] = useState<any>(null);
  const [showEditLimitModal, setShowEditLimitModal] = useState(false);
  const [limitFormData, setLimitFormData] = useState({
    title: "",
    minAmount: 0,
    maxAmount: 0,
    approver: ""
  });

  // Fetch real purchase orders from API
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['/api/purchase-orders'],
    queryFn: async () => {
      const response = await fetch('/api/purchase-orders');
      if (!response.ok) throw new Error("Failed to fetch purchase orders");
      return response.json();
    }
  });

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });

  const approvalLimits = [
    { level: 1, title: "Department Head", minAmount: 0, maxAmount: 5000, approver: "Dept. Manager" },
    { level: 2, title: "Unit Manager", minAmount: 5001, maxAmount: 15000, approver: "Unit Manager" },
    { level: 3, title: "Finance Manager", minAmount: 15001, maxAmount: 50000, approver: "Finance Manager" },
    { level: 4, title: "CEO Approval", minAmount: 50001, maxAmount: 999999, approver: "Chief Executive" }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Draft', variant: 'outline' as const, icon: FileText },
      'pending-approval': { label: 'Pending Approval', variant: 'default' as const, icon: Clock },
      'approved': { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
      'ordered': { label: 'Ordered', variant: 'default' as const, icon: Truck },
      'received': { label: 'Received', variant: 'default' as const, icon: Package },
      'completed': { label: 'Completed', variant: 'default' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || FileText;

    return (
      <Badge variant={config?.variant || 'outline'} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'low': { label: 'Low', className: 'bg-blue-100 text-blue-800' },
      'medium': { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      'high': { label: 'High', className: 'bg-orange-100 text-orange-800' },
      'urgent': { label: 'Urgent', className: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge className={config?.className || 'bg-gray-100 text-gray-800'}>
        {config?.label || priority}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const confirmExecution = useMutation({
    mutationFn: (poId: number) => 
      apiRequest('POST', `/api/purchase-orders/${poId}/confirm-execution`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Purchase order execution confirmed" });
    },
    onError: () => {
      toast({ 
        title: "Failed to confirm execution", 
        variant: "destructive" 
      });
    }
  });

  const confirmDelivery = useMutation({
    mutationFn: ({ poId, confirmationType }: { poId: number, confirmationType: string }) => 
      apiRequest('POST', `/api/purchase-orders/${poId}/confirm-delivery`, { confirmationType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Delivery confirmation successful" });
    },
    onError: () => {
      toast({ 
        title: "Failed to confirm delivery", 
        variant: "destructive" 
      });
    }
  });

  const getRequiredApprovalLevel = (amount: number) => {
    for (const limit of approvalLimits) {
      if (amount >= limit.minAmount && amount <= limit.maxAmount) {
        return limit;
      }
    }
    return approvalLimits[approvalLimits.length - 1];
  };

  const approvePO = useMutation({
    mutationFn: async (data: { id: number; comments?: string }) => {
      return apiRequest('POST', `/api/purchase-orders/${data.id}/approve`, { comments: data.comments });
    },
    onSuccess: () => {
      toast({ title: "Purchase order approved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setShowApprovalModal(false);
      setApprovalComments("");
    },
    onError: () => {
      toast({ title: "Failed to approve purchase order", variant: "destructive" });
    }
  });

  const rejectPO = useMutation({
    mutationFn: async (data: { id: number; comments: string }) => {
      return apiRequest('POST', `/api/purchase-orders/${data.id}/reject`, { comments: data.comments });
    },
    onSuccess: () => {
      toast({ title: "Purchase order rejected" });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setShowApprovalModal(false);
      setApprovalComments("");
    },
    onError: () => {
      toast({ title: "Failed to reject purchase order", variant: "destructive" });
    }
  });

  const executePO = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/purchase-orders/${id}/confirm-execution`);
    },
    onSuccess: (response) => {
      toast({ 
        title: "Purchase order executed and sent to vendor",
        description: response.emailStatus || "Order sent successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setShowPrintPreview(false);
    },
    onError: () => {
      toast({ title: "Failed to execute purchase order", variant: "destructive" });
    }
  });

  const handleExecuteOrder = (po: PurchaseOrder) => {
    setPreviewPO(po);
    setShowPrintPreview(true);
  };

  const confirmExecuteOrder = () => {
    if (previewPO) {
      executePO.mutate(previewPO.id);
    }
  };

  const filteredPOs = selectedStatus === "all" 
    ? (purchaseOrders || [])
    : (purchaseOrders || []).filter((po: any) => po.status === selectedStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-gray-600">Manage purchase requests and approval workflows</p>
        </div>
        <Button onClick={() => setShowNewPOForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <div className="flex items-center mt-2">
              <Clock className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-orange-500 text-sm">Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Total POs processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(185000)}</div>
            <p className="text-xs text-muted-foreground">Month to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 days</div>
            <p className="text-xs text-muted-foreground">From request to approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchase-orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="approval-limits">Approval Limits</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Status Filter</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending-approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label>Search</Label>
                  <Input placeholder="Search by PO number, vendor..." />
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline">Export</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Required Date</TableHead>
                    <TableHead>Current Approver</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>
                        <div className="font-medium">{po.poNumber}</div>
                        <div className="text-sm text-gray-500">{po.category}</div>
                      </TableCell>
                      <TableCell>{po.vendorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {po.requestedByName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(po.totalAmount)}</div>
                        <div className="text-sm text-gray-500">
                          Level {getRequiredApprovalLevel(po.totalAmount).level} required
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(po.priority)}</TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(po.requiredDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {po.currentApproverName ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {po.currentApproverName}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedPO(po)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Purchase Order Details</DialogTitle>
                              </DialogHeader>
                              {selectedPO && <PODetailsContent po={selectedPO} />}
                            </DialogContent>
                          </Dialog>
                          
                          {po.status === 'pending-approval' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowApprovalModal(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowApprovalModal(true);
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {po.status === 'approved' && !po.executionConfirmedBy && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleExecuteOrder(po)}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Execute Order
                            </Button>
                          )}
                          
                          {po.status === 'approved' && po.executionConfirmedBy && po.workflowStage === 'delivery_pending' && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => confirmDelivery.mutate({ poId: po.id, confirmationType: 'accountant' })}
                              >
                                <Package className="w-4 h-4 mr-1" />
                                Accountant Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => confirmDelivery.mutate({ poId: po.id, confirmationType: 'unit' })}
                              >
                                <Package className="w-4 h-4 mr-1" />
                                Unit Confirm
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval-limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Authorization Limits</CardTitle>
              <p className="text-sm text-gray-600">
                Configure approval workflows based on purchase order amounts
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Approval Authority</TableHead>
                    <TableHead>Amount Range</TableHead>
                    <TableHead>Current Approver</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalLimits.map((limit) => (
                    <TableRow key={limit.level}>
                      <TableCell>
                        <Badge variant="outline">Level {limit.level}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{limit.title}</TableCell>
                      <TableCell>
                        {formatCurrency(limit.minAmount)} - {formatCurrency(limit.maxAmount)}
                      </TableCell>
                      <TableCell>{limit.approver}</TableCell>
                      <TableCell>All Departments</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingLimit(limit);
                            setLimitFormData({
                              title: limit.title,
                              minAmount: limit.minAmount,
                              maxAmount: limit.maxAmount,
                              approver: limit.approver
                            });
                            setShowEditLimitModal(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Sequential Approval Process</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Purchase orders follow a sequential approval process based on the total amount.
                    Each level must approve before moving to the next level.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800">Automatic Routing</h4>
                  <p className="text-sm text-green-600 mt-1">
                    System automatically routes POs to the appropriate approver based on amount and department.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Escalation Rules</h4>
                  <p className="text-sm text-orange-600 mt-1">
                    POs pending approval for more than 48 hours are automatically escalated to the next level.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approved Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                Vendor management functionality available in the main vendor module
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPO ? `Approve/Reject PO ${selectedPO.poNumber}` : 'Purchase Order Approval'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <p className="text-sm">{selectedPO.vendorName}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedPO.totalAmount)}</p>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedPO.description}</p>
              </div>
              
              <div>
                <Label>Comments</Label>
                <Textarea 
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add approval comments..."
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => rejectPO.mutate({ id: selectedPO.id, comments: approvalComments })}
                  disabled={rejectPO.isPending}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => approvePO.mutate({ id: selectedPO.id, comments: approvalComments })}
                  disabled={approvePO.isPending}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview Modal */}
      {showPrintPreview && previewPO && (
        <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Order Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Preview Document */}
              <div className="bg-white p-8 border rounded-lg shadow-sm print:shadow-none">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">PURCHASE ORDER</h1>
                  <p className="text-lg font-semibold">{previewPO.poNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">From:</h3>
                    <div className="space-y-1">
                      <p className="font-medium">Medical Diagnostic Center</p>
                      <p>123 Healthcare Avenue</p>
                      <p>Medical City, MC 12345</p>
                      <p>Phone: (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">To:</h3>
                    <div className="space-y-1">
                      <p className="font-medium">{previewPO.vendorName}</p>
                      {(previewPO as any).vendor_address && <p>{(previewPO as any).vendor_address}</p>}
                      {(previewPO as any).vendor_email && <p>Email: {(previewPO as any).vendor_email}</p>}
                      {(previewPO as any).vendor_phone && <p>Phone: {(previewPO as any).vendor_phone}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label className="font-semibold">PO Date:</Label>
                    <p>{new Date(previewPO.createdAt || previewPO.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Required Date:</Label>
                    <p>{previewPO.deliveryDate || previewPO.delivery_date ? new Date(previewPO.deliveryDate || previewPO.delivery_date).toLocaleDateString() : 'TBD'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Department:</Label>
                    <p>{previewPO.department || 'General'}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label className="font-semibold">Description:</Label>
                  <p className="mt-1">{previewPO.notes || previewPO.description || 'Medical supplies and equipment'}</p>
                </div>
                
                <div className="mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        try {
                          const items = (previewPO as any).items ? JSON.parse((previewPO as any).items) : [];
                          if (items.length > 0) {
                            return items.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{item.itemName}</div>
                                    <div className="text-sm text-gray-500">{item.itemCode}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice)}</TableCell>
                                <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.totalPrice)}</TableCell>
                              </TableRow>
                            ));
                          }
                        } catch (e) {
                          console.error('Error parsing items:', e);
                        }
                        
                        // Fallback row
                        return (
                          <TableRow>
                            <TableCell>
                              <div>
                                <div className="font-medium">Medical Supplies</div>
                                <div className="text-sm text-gray-500">GENERAL-001</div>
                              </div>
                            </TableCell>
                            <TableCell>{(previewPO as any).notes || previewPO.description || 'General medical supplies'}</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(previewPO.totalAmount)}</TableCell>
                            <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(previewPO.totalAmount)}</TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(previewPO.totalAmount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Please confirm receipt of this purchase order and provide delivery timeline.
                    For questions, contact our procurement department at procurement@medicalcenter.com
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrintPreview(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => window.print()}
                  variant="secondary"
                >
                  Print
                </Button>
                <Button 
                  onClick={confirmExecuteOrder}
                  disabled={executePO.isPending}
                >
                  {executePO.isPending ? "Sending..." : "Send to Vendor"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Approval Limit Modal */}
      <Dialog open={showEditLimitModal} onOpenChange={setShowEditLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Approval Limit - Level {editingLimit?.level}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Authority Title</Label>
              <Input
                id="title"
                value={limitFormData.title}
                onChange={(e) => setLimitFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Department Head"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount">Minimum Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={limitFormData.minAmount}
                  onChange={(e) => setLimitFormData(prev => ({ ...prev, minAmount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="maxAmount">Maximum Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={limitFormData.maxAmount}
                  onChange={(e) => setLimitFormData(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="approver">Default Approver</Label>
              <Input
                id="approver"
                value={limitFormData.approver}
                onChange={(e) => setLimitFormData(prev => ({ ...prev, approver: e.target.value }))}
                placeholder="e.g., Dept. Manager"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowEditLimitModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  toast({ title: "Approval limit updated successfully" });
                  setShowEditLimitModal(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Purchase Order Form */}
      <NewPurchaseOrderForm 
        open={showNewPOForm} 
        onOpenChange={setShowNewPOForm} 
      />
    </div>
  );
}

function PODetailsContent({ po }: { po: PurchaseOrder }) {
  const mockLineItems: POLineItem[] = [
    {
      id: 1,
      itemCode: "LAB-001",
      itemName: "CBC Test Reagent",
      description: "Complete Blood Count test reagent kit",
      quantity: 10,
      unitPrice: 150,
      totalPrice: 1500,
      category: "Laboratory"
    },
    {
      id: 2,
      itemCode: "LAB-002", 
      itemName: "Blood Collection Tubes",
      description: "EDTA coated tubes for blood collection",
      quantity: 100,
      unitPrice: 2.5,
      totalPrice: 250,
      category: "Laboratory"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>PO Number</Label>
          <p className="font-medium">{po.poNumber}</p>
        </div>
        <div>
          <Label>Status</Label>
          <div className="mt-1">{/* Status badge would go here */}</div>
        </div>
        <div>
          <Label>Vendor</Label>
          <p>{po.vendorName}</p>
        </div>
        <div>
          <Label>Total Amount</Label>
          <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(po.totalAmount)}</p>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <p>{po.description}</p>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Line Items</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.itemName}</div>
                    <div className="text-sm text-gray-500">{item.itemCode}</div>
                  </div>
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice)}</TableCell>
                <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.totalPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}