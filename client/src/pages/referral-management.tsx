import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  FileText,
  Search,
  Filter,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface ReferralProvider {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  commissionRate?: number;
  status: 'active' | 'inactive';
  totalCommissions?: number;
  totalReferrals?: number;
  lastActivity?: string;
  createdAt: string;
}

export default function ReferralManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ReferralProvider | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    commissionRate: "",
    status: "active"
  });

  // Fetch referral providers
  const { data: providers, isLoading } = useQuery({
    queryKey: ["/api/referral-providers", user?.tenantId],
    queryFn: async () => {
      const response = await apiRequest(`/api/referral-providers/${user?.tenantId}`, "GET");
      return response.json();
    }
  });

  // Create provider mutation
  const createProviderMutation = useMutation({
    mutationFn: async (providerData: any) => {
      const response = await apiRequest("/api/referral-providers", "POST", {
        ...providerData,
        tenantId: user?.tenantId,
        requiresCommissionSetup: false
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral-providers", user?.tenantId] });
      setShowAddDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Referral provider created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create provider",
        variant: "destructive",
      });
    },
  });

  // Update provider mutation
  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest(`/api/referral-providers/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral-providers", user?.tenantId] });
      setShowEditDialog(false);
      setEditingProvider(null);
      resetForm();
      toast({
        title: "Success",
        description: "Provider updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update provider",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      commissionRate: "",
      status: "active"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Provider name is required",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null
    };

    if (editingProvider) {
      updateProviderMutation.mutate({ id: editingProvider.id, ...submitData });
    } else {
      createProviderMutation.mutate(submitData);
    }
  };

  const handleEdit = (provider: ReferralProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      contactPerson: provider.contactPerson || "",
      email: provider.email || "",
      phone: provider.phone || "",
      address: provider.address || "",
      commissionRate: provider.commissionRate?.toString() || "",
      status: provider.status
    });
    setShowEditDialog(true);
  };

  const filteredProviders = providers?.filter((provider: ReferralProvider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || provider.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "₦0.00";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Provider Management</h1>
          <p className="text-gray-600">Manage referral providers and commission rates</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/center-manager-dashboard">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-2xl font-bold">{providers?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Providers</p>
                <p className="text-2xl font-bold">
                  {providers?.filter((p: ReferralProvider) => p.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(providers?.reduce((sum: number, p: ReferralProvider) => sum + (p.totalCommissions || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold">
                  {providers?.reduce((sum: number, p: ReferralProvider) => sum + (p.totalReferrals || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading providers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Referrals</TableHead>
                  <TableHead>Total Commissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider: ReferralProvider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.contactPerson || "-"}</TableCell>
                    <TableCell>{provider.phone || "-"}</TableCell>
                    <TableCell>
                      {provider.commissionRate ? `${provider.commissionRate}%` : "Not Set"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(provider.status)}>
                        {provider.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{provider.totalReferrals || 0}</TableCell>
                    <TableCell>{formatCurrency(provider.totalCommissions)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingProvider(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? "Edit Referral Provider" : "Add New Referral Provider"}
            </DialogTitle>
            <DialogDescription>
              {editingProvider ? "Update provider information and commission rates" : "Create a new referral provider with commission settings"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Provider Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter provider name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Contact person name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="provider@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Provider address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
                  placeholder="e.g., 5.0"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Banking Details Section */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Banking Details for Payments</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g., First Bank of Nigeria"
                  />
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="Account holder name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="bankCode">Bank Code</Label>
                  <Input
                    id="bankCode"
                    value={formData.bankCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankCode: e.target.value }))}
                    placeholder="e.g., 011"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortCode">Sort Code</Label>
                  <Input
                    id="sortCode"
                    value={formData.sortCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortCode: e.target.value }))}
                    placeholder="e.g., 12-34-56"
                  />
                </div>
                <div>
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    value={formData.swiftCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, swiftCode: e.target.value }))}
                    placeholder="e.g., FIRSTNGL"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                  setEditingProvider(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProviderMutation.isPending || updateProviderMutation.isPending}
              >
                {createProviderMutation.isPending || updateProviderMutation.isPending ? "Saving..." : 
                 editingProvider ? "Update Provider" : "Create Provider"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}