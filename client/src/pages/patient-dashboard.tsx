import { useState } from "react";
import { Link } from "wouter";
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  FileText, 
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: todayStats } = useQuery({
    queryKey: ["/api/patients/today-stats"],
  });

  const filteredPatients = patients.filter((patient: any) =>
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Patient registration, records, and services</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/patient-intake">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Patient
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Patients
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-green-600">↗ Active records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Visits
              </CardTitle>
              <Calendar className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats?.visits || 8}</div>
              <p className="text-xs text-blue-600">5 walk-ins, 3 appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Tests
              </CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats?.pending || 12}</div>
              <p className="text-xs text-orange-600">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenue Today
              </CardTitle>
              <CreditCard className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦235,500</div>
              <p className="text-xs text-green-600">↗ 15% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              Search and manage patient information
            </CardDescription>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.slice(0, 10).map((patient: any) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {patient.patientId} • {patient.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </Badge>
                    <Link href={`/patient-management?id=${patient.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Record
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Registration</CardTitle>
              <CardDescription>Register new patients and update records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patient-intake">
                <Button className="w-full">New Patient Registration</Button>
              </Link>
              <Link href="/patient-management">
                <Button variant="outline" className="w-full">Manage Existing Patients</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Processing</CardTitle>
              <CardDescription>Test orders and service delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/laboratory-management">
                <Button className="w-full">Laboratory Tests</Button>
              </Link>
              <Link href="/cardiology-dashboard">
                <Button variant="outline" className="w-full">Cardiology Services</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Services</CardTitle>
              <CardDescription>Billing and payment processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patient-billing">
                <Button className="w-full">Patient Billing</Button>
              </Link>
              <Link href="/daily-transactions">
                <Button variant="outline" className="w-full">Transaction History</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}