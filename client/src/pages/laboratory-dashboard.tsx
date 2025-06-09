import { useState } from "react";
import { Link } from "wouter";
import { 
  Microscope, 
  TestTube, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Users,
  FileText,
  Download,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function LaboratoryDashboard() {
  const { data: labStats } = useQuery({
    queryKey: ["/api/laboratory/stats"],
  });

  const { data: labMetrics } = useQuery({
    queryKey: ["/api/laboratory/metrics"],
  });

  const { data: pendingTests = [] } = useQuery({
    queryKey: ["/api/laboratory/pending-tests"],
  });

  const { data: recentResults = [] } = useQuery({
    queryKey: ["/api/laboratory/recent-results"],
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laboratory Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Test processing, results, and quality control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tests Today
              </CardTitle>
              <TestTube className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labMetrics?.totalRequests || 0}</div>
              <p className="text-xs text-green-600">↗ Total requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Results
              </CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labMetrics?.inProcessing || 0}</div>
              <p className="text-xs text-orange-600">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labMetrics?.completedToday || 0}</div>
              <p className="text-xs text-green-600">Ready for review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Quality Control
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Passed</div>
              <p className="text-xs text-gray-600">All systems normal</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Microscope className="w-5 h-5 text-blue-500" />
                <span>Hematology</span>
              </CardTitle>
              <CardDescription>Blood cell analysis and coagulation studies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Full Blood Count</span>
                  <Badge variant="secondary">8 pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ESR</span>
                  <Badge variant="secondary">3 completed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Coagulation Studies</span>
                  <Badge variant="secondary">2 in progress</Badge>
                </div>
                <Link href="/laboratory-management?category=hematology">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Tests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5 text-green-500" />
                <span>Clinical Chemistry</span>
              </CardTitle>
              <CardDescription>Biochemical analysis and metabolic panels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Liver Function</span>
                  <Badge variant="secondary">5 pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Kidney Function</span>
                  <Badge variant="secondary">4 completed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lipid Profile</span>
                  <Badge variant="secondary">3 in progress</Badge>
                </div>
                <Link href="/laboratory-management?category=chemistry">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Tests
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-purple-500" />
                <span>Microbiology</span>
              </CardTitle>
              <CardDescription>Culture studies and sensitivity testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Urine Culture</span>
                  <Badge variant="secondary">2 pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Blood Culture</span>
                  <Badge variant="secondary">1 in progress</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stool Analysis</span>
                  <Badge variant="secondary">3 completed</Badge>
                </div>
                <Link href="/laboratory-management?category=microbiology">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Tests
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
              <CardTitle>Pending Tests</CardTitle>
              <CardDescription>Tests awaiting processing or results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { patient: "Adebayo Ogundimu", test: "Full Blood Count + ESR", time: "30 min ago", priority: "urgent" },
                  { patient: "Fatima Abdullahi", test: "Liver Function Tests", time: "1 hour ago", priority: "routine" },
                  { patient: "Chinedu Okwu", test: "Lipid Profile", time: "2 hours ago", priority: "routine" },
                  { patient: "Blessing Eze", test: "Kidney Function", time: "3 hours ago", priority: "routine" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TestTube className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.patient}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.test}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Completed tests ready for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { patient: "Ibrahim Yusuf", test: "Kidney Function Tests", status: "Normal", time: "5 min ago" },
                  { patient: "Kemi Adebayo", test: "Full Blood Count", status: "Abnormal", time: "15 min ago" },
                  { patient: "Olu Martins", test: "Lipid Profile", status: "Normal", time: "25 min ago" },
                  { patient: "Grace Okafor", test: "Liver Function", status: "Review", time: "45 min ago" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.patient}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.test}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'Normal' ? 'secondary' : item.status === 'Abnormal' ? 'destructive' : 'outline'}>
                        {item.status}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
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
            <CardTitle>Laboratory Operations</CardTitle>
            <CardDescription>Access laboratory management functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/laboratory-management">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Microscope className="w-6 h-6" />
                  <span className="text-xs">Test Management</span>
                </Button>
              </Link>
              
              <Link href="/quality-assurance">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-xs">Quality Control</span>
                </Button>
              </Link>
              
              <Link href="/reference-ranges">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">Reference Ranges</span>
                </Button>
              </Link>
              
              <Link href="/test-consumption-management">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span className="text-xs">Consumables</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}