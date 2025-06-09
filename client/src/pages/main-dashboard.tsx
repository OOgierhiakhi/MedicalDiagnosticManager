import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Building2, 
  Users, 
  Calculator, 
  FileText, 
  Package, 
  Stethoscope, 
  MessageSquare, 
  Settings, 
  TrendingUp,
  Shield,
  CreditCard,
  ClipboardList,
  UserCheck,
  Database,
  Home,
  ChevronLeft,
  ChevronRight,
  Activity,
  DollarSign,
  Heart,
  Microscope,
  Truck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/main-dashboard",
    description: "Main overview"
  },
  {
    title: "Patient Management",
    icon: Users,
    path: "/patient-dashboard",
    description: "Patient records & services"
  },
  {
    title: "Laboratory",
    icon: Microscope,
    path: "/laboratory-dashboard", 
    description: "Test processing & results"
  },
  {
    title: "Imaging Services",
    icon: Activity,
    path: "/imaging-dashboard",
    description: "X-Ray, CT, Echo services"
  },
  {
    title: "Cardiology Unit",
    icon: Heart,
    path: "/cardiology-dashboard",
    description: "ECG, stress tests, monitoring"
  },
  {
    title: "Financial Management",
    icon: DollarSign,
    path: "/accounting-dashboard",
    description: "Revenue, expenses, reporting"
  },
  {
    title: "Billing & Payments",
    icon: CreditCard,
    path: "/billing-dashboard",
    description: "Invoice management & payments"
  },
  {
    title: "Inventory Control",
    icon: Package,
    path: "/inventory-dashboard",
    description: "Medical supplies & equipment"
  },
  {
    title: "Procurement",
    icon: Truck,
    path: "/procurement-dashboard",
    description: "Purchase orders & vendors"
  },
  {
    title: "Center Management",
    icon: Building2,
    path: "/center-manager-dashboard",
    description: "Operations oversight"
  },
  {
    title: "User Administration",
    icon: Shield,
    path: "/user-management",
    description: "Roles & permissions"
  },
  {
    title: "Reports & Analytics",
    icon: TrendingUp,
    path: "/analytics-dashboard",
    description: "Business intelligence"
  },
  {
    title: "Messages",
    icon: MessageSquare,
    path: "/messages-dashboard",
    description: "Internal communications"
  },
  {
    title: "Data Import",
    icon: Database,
    path: "/data-import",
    description: "Historical data loading"
  }
];

export default function MainDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [location] = useLocation();
  
  const { data: organizationData } = useQuery({
    queryKey: ["/api/organization-branding"],
  });

  const { data: dashboardMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0, // Always refetch when component mounts
  });

  const { data: recentActivity, refetch: refetchActivity } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                  {organizationData?.organizationName || "Orient Medical"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Diagnostic Centre</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-NG', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Orient Medical Diagnostic Centre
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive Healthcare Management System
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Patients
                </CardTitle>
                <Users className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardMetrics?.totalPatients || 0}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Today's unique patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revenue Today
                </CardTitle>
                <DollarSign className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    minimumFractionDigits: 0,
                  }).format(dashboardMetrics?.revenueToday || 0)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  From today's transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Tests
                </CardTitle>
                <Activity className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardMetrics?.activeTests || 0}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Tests in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  System Status
                </CardTitle>
                <Activity className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardMetrics?.systemStatus || "Online"}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Units Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Cardiology Unit</span>
                </CardTitle>
                <CardDescription>
                  ECG, Echocardiography, Stress Testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Today's Tests</span>
                    <Badge variant="secondary">8 completed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Equipment Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      All Operational
                    </Badge>
                  </div>
                  <Link href="/cardiology-dashboard">
                    <Button className="w-full mt-3" variant="outline" size="sm">
                      Manage Unit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Microscope className="w-5 h-5 text-blue-500" />
                  <span>Laboratory</span>
                </CardTitle>
                <CardDescription>
                  Hematology, Chemistry, Microbiology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending Results</span>
                    <Badge variant="secondary">12 tests</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quality Control</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Passed
                    </Badge>
                  </div>
                  <Link href="/laboratory-dashboard">
                    <Button className="w-full mt-3" variant="outline" size="sm">
                      Manage Unit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span>Imaging Services</span>
                </CardTitle>
                <CardDescription>
                  X-Ray, CT Scan, Ultrasound
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Scheduled Studies</span>
                    <Badge variant="secondary">5 pending</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Equipment</span>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      1 Maintenance
                    </Badge>
                  </div>
                  <Link href="/imaging-dashboard">
                    <Button className="w-full mt-3" variant="outline" size="sm">
                      Manage Unit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and department access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Link href="/patient-dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Users className="w-6 h-6" />
                    <span className="text-xs">New Patient</span>
                  </Button>
                </Link>
                
                <Link href="/laboratory-dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Microscope className="w-6 h-6" />
                    <span className="text-xs">Lab Tests</span>
                  </Button>
                </Link>
                
                <Link href="/billing-dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Calculator className="w-6 h-6" />
                    <span className="text-xs">Billing</span>
                  </Button>
                </Link>
                
                <Link href="/inventory-dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <Package className="w-6 h-6" />
                    <span className="text-xs">Inventory</span>
                  </Button>
                </Link>
                
                <Link href="/messages-dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-xs">Messages</span>
                  </Button>
                </Link>
                
                <Link href="/analytics-dashboard">
                  <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-xs">Reports</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}