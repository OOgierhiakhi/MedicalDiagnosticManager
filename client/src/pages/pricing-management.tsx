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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Package,
  FileText,
  Search,
  Filter,
  Home,
  Activity,
  Target,
  Heart,
  Brain,
  Microscope,
  Stethoscope
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface DiagnosticService {
  id: number;
  name: string;
  category: string;
  department: string;
  price: number;
  maxRebateAmount: number;
  status: 'active' | 'inactive';
  description?: string;
  duration?: number;
  preparationRequired?: boolean;
  fastingRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  department: string;
}

const serviceCategories: ServiceCategory[] = [
  { id: 'laboratory', name: 'Laboratory Tests', description: 'Blood tests, urine analysis, cultures', icon: Microscope, department: 'laboratory' },
  { id: 'radiology', name: 'Radiology & Imaging', description: 'X-rays, CT scans, MRI, ultrasound', icon: Target, department: 'radiology' },
  { id: 'cardiology', name: 'Cardiology Services', description: 'ECG, echocardiogram, stress tests', icon: Heart, department: 'cardiology' },
  { id: 'neurology', name: 'Neurology Services', description: 'EEG, brain imaging, nerve studies', icon: Brain, department: 'neurology' },
  { id: 'general', name: 'General Consultation', description: 'Doctor consultations and examinations', icon: Stethoscope, department: 'consultation' },
  { id: 'packages', name: 'Health Packages', description: 'Comprehensive health check packages', icon: Package, department: 'packages' }
];

export default function PricingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingService, setEditingService] = useState<DiagnosticService | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  
  // Bulk operations states
  const [bulkCategory, setBulkCategory] = useState("all");
  const [priceChangePercent, setPriceChangePercent] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    department: "",
    price: "",
    maxRebateAmount: "",
    description: "",
    duration: "",
    preparationRequired: false,
    fastingRequired: false,
    status: "active"
  });

  // Fetch diagnostic services
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/tests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tests");
      const data = await response.json();
      // Map API response to frontend format
      return data.map((service: any) => ({
        ...service,
        category: service.categoryId || 'Unknown',
        status: service.isActive ? 'active' : 'inactive'
      }));
    }
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await apiRequest("POST", "/api/tests", {
        ...serviceData,
        tenantId: user?.tenantId,
        branchId: user?.branchId || 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests", user?.tenantId] });
      setShowAddDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Diagnostic service created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PUT", `/api/tests/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setShowEditDialog(false);
      setEditingService(null);
      resetForm();
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    },
  });

  // Bulk price update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: { category: string; priceChangePercent: number }) => {
      const response = await apiRequest("PUT", "/api/tests/bulk-update", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      setBulkCategory("all");
      setPriceChangePercent("");
      toast({
        title: "Success",
        description: `Updated ${data.updatedCount} services successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update services",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      department: "",
      price: "",
      maxRebateAmount: "",
      description: "",
      duration: "",
      preparationRequired: false,
      fastingRequired: false,
      status: "active"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Service name and price are required",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      maxRebateAmount: formData.maxRebateAmount ? parseFloat(formData.maxRebateAmount) : 0,
      duration: formData.duration ? parseInt(formData.duration) : null
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...submitData });
    } else {
      createServiceMutation.mutate(submitData);
    }
  };

  const handleEdit = (service: DiagnosticService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      department: service.department,
      price: service.price.toString(),
      maxRebateAmount: service.maxRebateAmount?.toString() || "",
      description: service.description || "",
      duration: service.duration?.toString() || "",
      preparationRequired: service.preparationRequired || false,
      fastingRequired: service.fastingRequired || false,
      status: service.status
    });
    setShowEditDialog(true);
  };

  const handleBulkUpdate = () => {
    if (!priceChangePercent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a price change percentage",
        variant: "destructive",
      });
      return;
    }

    const percent = parseFloat(priceChangePercent);
    if (isNaN(percent) || percent === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price change percentage",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateMutation.mutate({
      category: bulkCategory,
      priceChangePercent: percent
    });
  };

  const filteredServices = services?.filter((service: DiagnosticService) => {
    const matchesSearch = !searchTerm || 
                         service.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                         service.category?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                         service.department?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Service Pricing Management</h1>
          <p className="text-gray-600">Manage diagnostic service prices and rebate settings</p>
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
            Add Service
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services Pricing</TabsTrigger>
          <TabsTrigger value="categories">Service Categories</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold">{services?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                    <p className="text-2xl font-bold">
                      {services?.filter((s: DiagnosticService) => s.status === 'active').length || 0}
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
                    <p className="text-sm font-medium text-gray-600">Average Price</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(services?.reduce((sum: number, s: DiagnosticService) => sum + s.price, 0) / (services?.length || 1) || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold">
                      {new Set(services?.map((s: DiagnosticService) => s.category)).size || 0}
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
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {serviceCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
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

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading services...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Max Rebate</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service: DiagnosticService) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>{service.department}</TableCell>
                        <TableCell>{formatCurrency(service.price)}</TableCell>
                        <TableCell>{formatCurrency(service.maxRebateAmount || 0)}</TableCell>
                        <TableCell>{service.duration ? `${service.duration} min` : "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              const categoryServices = services?.filter((s: DiagnosticService) => s.category === category.id) || [];
              return (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Services:</span>
                        <span className="font-medium">{categoryServices.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Price:</span>
                        <span className="font-medium">
                          {formatCurrency(categoryServices.reduce((sum, s) => sum + s.price, 0) / (categoryServices.length || 1))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="font-medium capitalize">{category.department}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Price Updates</CardTitle>
              <p className="text-sm text-gray-600">Apply percentage-based price changes to multiple services</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {serviceCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price Change (%)</Label>
                  <Input 
                    placeholder="e.g., 10 for 10% increase, -5 for 5% decrease" 
                    value={priceChangePercent}
                    onChange={(e) => setPriceChangePercent(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    className="w-full" 
                    onClick={handleBulkUpdate}
                    disabled={bulkUpdateMutation.isPending}
                  >
                    {bulkUpdateMutation.isPending ? "Applying..." : "Apply Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Service Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingService(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Diagnostic Service" : "Add New Diagnostic Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService ? "Update service information and pricing" : "Create a new diagnostic service with pricing details"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="packages">Packages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g., 5000.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxRebateAmount">Max Rebate Amount (₦)</Label>
                <Input
                  id="maxRebateAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxRebateAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxRebateAmount: e.target.value }))}
                  placeholder="e.g., 500.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Service description and notes"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preparationRequired"
                  checked={formData.preparationRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparationRequired: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="preparationRequired" className="text-sm">Preparation Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fastingRequired"
                  checked={formData.fastingRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, fastingRequired: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="fastingRequired" className="text-sm">Fasting Required</Label>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                  setEditingService(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                {createServiceMutation.isPending || updateServiceMutation.isPending ? "Saving..." : 
                 editingService ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}