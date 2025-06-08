import { useState } from "react";
import { Link } from "wouter";
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  FileText,
  Users,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function ProcurementDashboard() {
  const { data: procurementStats } = useQuery({
    queryKey: ["/api/procurement/stats"],
  });

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["/api/purchase-orders", { status: "pending" }],
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["/api/purchase-orders", { recent: true }],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/main-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Procurement Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Purchase orders, vendor management, and procurement workflows</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/purchase-orders">
              <Button>
                <Package className="w-4 h-4 mr-2" />
                New Purchase Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Orders
              </CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-blue-600">3 pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Spend
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦2.4M</div>
              <p className="text-xs text-green-600">↗ 8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved Today
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-600">₦485,000 total value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Vendors
              </CardTitle>
              <Users className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-purple-600">8 preferred suppliers</p>
            </CardContent>
          </Card>
        </div>

        {/* Procurement Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span>Medical Supplies</span>
              </CardTitle>
              <CardDescription>Laboratory reagents and consumables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lab Reagents</span>
                  <Badge variant="secondary">₦450,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Test Kits</span>
                  <Badge variant="secondary">₦320,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Consumables</span>
                  <Badge variant="secondary">₦180,000</Badge>
                </div>
                <Link href="/purchase-orders?category=medical">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-green-500" />
                <span>Equipment & Maintenance</span>
              </CardTitle>
              <CardDescription>Medical equipment and service contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CT Scanner Repair</span>
                  <Badge className="bg-green-100 text-green-800">Approved: ₦120,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Service Contracts</span>
                  <Badge variant="secondary">₦850,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Equipment Parts</span>
                  <Badge variant="secondary">₦245,000</Badge>
                </div>
                <Link href="/purchase-orders?category=equipment">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>Professional Services</span>
              </CardTitle>
              <CardDescription>Consultant services and outsourcing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Imaging Analysis</span>
                  <Badge className="bg-green-100 text-green-800">Paid: ₦97,750</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">IT Support</span>
                  <Badge variant="secondary">₦125,000</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Training Services</span>
                  <Badge variant="secondary">₦75,000</Badge>
                </div>
                <Link href="/purchase-orders?category=services">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Purchase orders awaiting authorization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { po: "PO-2024-156", vendor: "Bio-Lab Solutions", amount: "₦275,000", item: "Hematology Reagents", priority: "routine" },
                  { po: "PO-2024-157", vendor: "MedEquip Nigeria", amount: "₦450,000", item: "Ultrasound Probes", priority: "urgent" },
                  { po: "PO-2024-158", vendor: "Phillips Healthcare", amount: "₦125,000", item: "Service Contract", priority: "routine" },
                ].map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{order.po}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.vendor}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{order.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{order.amount}</p>
                      <Badge variant={order.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {order.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Recently processed purchase orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { po: "PO-2024-153", vendor: "Siemens Healthineers", amount: "₦120,000", status: "paid", item: "Emergency CT Repair" },
                  { po: "PO-2024-154", vendor: "Advanced Imaging Solutions", amount: "₦97,750", status: "completed", item: "Imaging Analysis Services" },
                  { po: "PO-2024-155", vendor: "Lab Equipment Co", amount: "₦85,000", status: "delivered", item: "Calibration Standards" },
                ].map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{order.po}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.vendor}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{order.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{order.amount}</p>
                      <Badge variant="secondary">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Procurement Operations</CardTitle>
            <CardDescription>Access procurement management functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/purchase-orders">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Package className="w-6 h-6" />
                  <span className="text-xs">Purchase Orders</span>
                </Button>
              </Link>
              
              <Link href="/purchase-order-approvals">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-xs">Approvals</span>
                </Button>
              </Link>
              
              <Link href="/goods-receipt">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Truck className="w-6 h-6" />
                  <span className="text-xs">Goods Receipt</span>
                </Button>
              </Link>
              
              <Link href="/invoice-matching">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">Invoice Matching</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}