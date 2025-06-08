import { useState } from "react";
import { Link } from "wouter";
import { 
  Activity, 
  Monitor, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Camera,
  Heart,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function ImagingDashboard() {
  const { data: imagingStats } = useQuery({
    queryKey: ["/api/imaging/stats"],
  });

  const { data: scheduledStudies = [] } = useQuery({
    queryKey: ["/api/imaging/scheduled"],
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Imaging Services</h1>
              <p className="text-gray-600 dark:text-gray-400">X-Ray, CT Scan, Ultrasound, and Diagnostic Imaging</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Equipment Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                X-Ray Machine
              </CardTitle>
              <Camera className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">Operational</div>
              <p className="text-xs text-gray-600">12 studies today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                CT Scanner
              </CardTitle>
              <Monitor className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-yellow-600">Maintenance</div>
              <p className="text-xs text-orange-600">Scheduled repair: 2hrs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ultrasound
              </CardTitle>
              <Activity className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">Operational</div>
              <p className="text-xs text-gray-600">8 studies today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Echo Machine
              </CardTitle>
              <Heart className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">Operational</div>
              <p className="text-xs text-gray-600">5 studies completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-blue-500" />
                <span>General Radiology</span>
              </CardTitle>
              <CardDescription>X-Ray and general imaging studies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Chest X-Ray</span>
                  <Badge variant="secondary">8 scheduled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Abdominal X-Ray</span>
                  <Badge variant="secondary">3 completed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bone X-Ray</span>
                  <Badge variant="secondary">2 in progress</Badge>
                </div>
                <Link href="/radiology-management?type=xray">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Studies
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span>Ultrasound Services</span>
              </CardTitle>
              <CardDescription>Abdominal, pelvic, and specialized ultrasound</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Abdominal US</span>
                  <Badge variant="secondary">4 pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pelvic US</span>
                  <Badge variant="secondary">2 completed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Thyroid US</span>
                  <Badge variant="secondary">1 in progress</Badge>
                </div>
                <Link href="/ultrasound-dashboard">
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    Manage Studies
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-red-500" />
                <span>CT Imaging</span>
              </CardTitle>
              <CardDescription>Advanced cross-sectional imaging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Head CT</span>
                  <Badge variant="destructive">Equipment Down</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Chest CT</span>
                  <Badge variant="destructive">Equipment Down</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency: ₦120,000 repair</span>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>
                <Button className="w-full mt-3" variant="outline" size="sm" disabled>
                  Under Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Studies</CardTitle>
              <CardDescription>Today's imaging appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "09:00", patient: "Adebayo Ogundimu", study: "Chest X-Ray", status: "completed" },
                  { time: "10:30", patient: "Fatima Abdullahi", study: "Abdominal US", status: "in_progress" },
                  { time: "11:15", patient: "Chinedu Okwu", study: "Echocardiogram", status: "pending" },
                  { time: "14:00", patient: "Blessing Eze", study: "Pelvic US", status: "pending" },
                  { time: "15:30", patient: "Ibrahim Yusuf", study: "Bone X-Ray", status: "pending" },
                ].map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{appointment.patient}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.study}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.time}</p>
                      <Badge variant={
                        appointment.status === 'completed' ? 'secondary' : 
                        appointment.status === 'in_progress' ? 'outline' : 
                        'destructive'
                      }>
                        {appointment.status === 'completed' ? 'Done' : 
                         appointment.status === 'in_progress' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Completed studies ready for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { patient: "Kemi Adebayo", study: "Chest X-Ray", finding: "Normal study", time: "2 hours ago" },
                  { patient: "Olu Martins", study: "Abdominal US", finding: "Mild hepatomegaly", time: "3 hours ago" },
                  { patient: "Grace Okafor", study: "Echocardiogram", finding: "Normal cardiac function", time: "4 hours ago" },
                  { patient: "David Emeka", study: "Bone X-Ray", finding: "No acute fracture", time: "5 hours ago" },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{report.patient}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{report.study}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{report.finding}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{report.time}</p>
                      <Badge variant="secondary">Reported</Badge>
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
            <CardTitle>Imaging Operations</CardTitle>
            <CardDescription>Access imaging management functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/radiology-management">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Camera className="w-6 h-6" />
                  <span className="text-xs">X-Ray Management</span>
                </Button>
              </Link>
              
              <Link href="/ultrasound-dashboard">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Activity className="w-6 h-6" />
                  <span className="text-xs">Ultrasound</span>
                </Button>
              </Link>
              
              <Link href="/cardiology-dashboard">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Heart className="w-6 h-6" />
                  <span className="text-xs">Echocardiography</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2" disabled>
                <Monitor className="w-6 h-6" />
                <span className="text-xs">CT Scanner</span>
                <span className="text-xs text-red-500">(Maintenance)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}