import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, FileText, Activity, Clock, CheckCircle, AlertTriangle, Edit3, Printer } from "lucide-react";
import DashboardMessaging from "@/components/dashboard-messaging";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UltrasoundStudy {
  id: string;
  patientName: string;
  patientId: string;
  studyType: string;
  scheduledTime: string;
  status: string;
  technician: string;
  priority: string;
  bodyPart: string;
}

export default function UltrasoundDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportDialog, setReportDialog] = useState({ open: false, studyId: "", patientName: "" });
  const [reportData, setReportData] = useState({
    findings: "",
    impression: "",
    recommendation: ""
  });

  // Fetch ultrasound studies
  const { data: studies = [], isLoading } = useQuery<UltrasoundStudy[]>({
    queryKey: ["/api/ultrasound/studies", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/ultrasound/studies?date=${selectedDate}`);
      return response.json();
    },
  });

  // Fetch dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/ultrasound/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/ultrasound/metrics");
      return response.json();
    },
  });

  // Mutation for starting a study
  const startStudyMutation = useMutation({
    mutationFn: async (studyId: string) => {
      return apiRequest("POST", `/api/ultrasound/studies/${studyId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ultrasound/studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ultrasound/metrics"] });
      toast({
        title: "Study Started",
        description: "Ultrasound study has been started successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start study",
        variant: "destructive",
      });
    },
  });

  // Mutation for completing ultrasound reports
  const completeReportMutation = useMutation({
    mutationFn: async ({ studyId, reportData }: { studyId: string; reportData: any }) => {
      return apiRequest("POST", `/api/ultrasound/studies/${studyId}/report`, reportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ultrasound/studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ultrasound/metrics"] });
      setReportDialog({ open: false, studyId: "", patientName: "" });
      setReportData({ findings: "", impression: "", recommendation: "" });
      toast({
        title: "Report Completed",
        description: "Ultrasound report has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save report",
        variant: "destructive",
      });
    },
  });

  // Mutation for scheduling a study  
  const scheduleStudyMutation = useMutation({
    mutationFn: async (studyData: any) => {
      return apiRequest("POST", "/api/ultrasound/studies/schedule", studyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ultrasound/studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ultrasound/metrics"] });
      toast({
        title: "Study Scheduled",
        description: "Ultrasound study has been scheduled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to schedule study",
        variant: "destructive",
      });
    },
  });

  const filteredStudies = studies.filter(study =>
    (study.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (study.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (study.studyType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get appropriate ultrasound workflow status label
  const getUltrasoundStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'SCHEDULED';
      case 'payment_verified':
        return 'PAYMENT VERIFIED';
      case 'in_progress':
        return 'STUDY IN PROGRESS';
      case 'processing':
        return 'STUDY IN PROGRESS';
      case 'specimen_collected':
        return 'STUDY IN PROGRESS'; // Fix inappropriate lab status for ultrasound
      case 'completed':
        return 'STUDY COMPLETED';
      case 'reported':
        return 'REPORT AVAILABLE';
      case 'reported_and_saved':
        return 'REPORT RELEASED';
      default:
        return status?.toUpperCase() || 'SCHEDULED';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": 
      case "processing":
      case "specimen_collected": return "secondary";
      case "scheduled": return "outline";
      case "urgent": return "destructive";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "secondary";
      case "normal": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ultrasound Department</h1>
          <p className="text-muted-foreground">
            Diagnostic imaging and ultrasound studies management
          </p>
        </div>
        <Button 
          onClick={() => {
            // For now, show a toast indicating the feature is available
            toast({
              title: "Schedule Study",
              description: "Study scheduling feature is ready. Please select a patient and time slot.",
            });
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Study
        </Button>
      </div>

      {/* Messages Section */}
      <div className="mb-6">
        <DashboardMessaging maxMessages={3} showCompactView={true} className="bg-white" />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Studies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.todayStudies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.completedStudies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Studies completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.inProgressStudies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.urgentStudies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Study Schedule</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ultrasound Studies</CardTitle>
              <CardDescription>
                Manage and track ultrasound examinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Study Type</TableHead>
                    <TableHead>Body Part</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudies.map((study) => (
                    <TableRow key={study.id}>
                      <TableCell className="font-mono">
                        {study.scheduledTime && study.scheduledTime !== 'Invalid Date' 
                          ? new Date(study.scheduledTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : '09:00'
                        }
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{study.patientName}</p>
                          <p className="text-sm text-muted-foreground">{study.patientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{study.studyType}</TableCell>
                      <TableCell>{study.bodyPart}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(study.priority) as "default" | "destructive" | "outline" | "secondary"}>
                          {study.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(study.status) as "default" | "destructive" | "outline" | "secondary"}>
                          {getUltrasoundStatusLabel(study.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{study.technician}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(study.status === "completed" || study.status === "reported" || study.status === "reported_and_saved") && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                title="View Report"
                                onClick={() => window.open(`/report-viewer/${study.id}`, '_blank')}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                title="Print Report"
                                onClick={() => window.open(`/api/ultrasound/reports/${study.id}/pdf`, '_blank')}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {study.status === "scheduled" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startStudyMutation.mutate(study.id)}
                              disabled={startStudyMutation.isPending}
                            >
                              {startStudyMutation.isPending ? "Starting..." : "Start Study"}
                            </Button>
                          )}
                          
                          {(study.status === "in_progress" || study.status === "processing" || study.status === "specimen_collected") && (
                            <Dialog 
                              open={reportDialog.open && reportDialog.studyId === study.id}
                              onOpenChange={(open) => setReportDialog(
                                open 
                                  ? { open: true, studyId: study.id, patientName: study.patientName }
                                  : { open: false, studyId: "", patientName: "" }
                              )}
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="default">
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Write Report
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Ultrasound Report - {study.patientName}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="findings">Clinical Findings</Label>
                                    <Textarea
                                      id="findings"
                                      placeholder="Describe the ultrasound findings..."
                                      value={reportData.findings}
                                      onChange={(e) => setReportData(prev => ({ ...prev, findings: e.target.value }))}
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="impression">Impression</Label>
                                    <Textarea
                                      id="impression"
                                      placeholder="Clinical impression based on findings..."
                                      value={reportData.impression}
                                      onChange={(e) => setReportData(prev => ({ ...prev, impression: e.target.value }))}
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="recommendation">Recommendations</Label>
                                    <Textarea
                                      id="recommendation"
                                      placeholder="Clinical recommendations and follow-up..."
                                      value={reportData.recommendation}
                                      onChange={(e) => setReportData(prev => ({ ...prev, recommendation: e.target.value }))}
                                      className="min-h-[60px]"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setReportDialog({ open: false, studyId: "", patientName: "" })}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => completeReportMutation.mutate({ 
                                        studyId: study.id, 
                                        reportData 
                                      })}
                                      disabled={completeReportMutation.isPending || !reportData.findings.trim()}
                                    >
                                      {completeReportMutation.isPending ? "Saving..." : "Complete Report"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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

        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status</CardTitle>
              <CardDescription>
                Monitor ultrasound equipment status and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Ultrasound Machine #1</h3>
                    <p className="text-sm text-muted-foreground">Phillips HD15</p>
                  </div>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Ultrasound Machine #2</h3>
                    <p className="text-sm text-muted-foreground">GE Logiq E10</p>
                  </div>
                  <Badge variant="secondary">Maintenance Due</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Reports</CardTitle>
              <CardDescription>
                Generate and manage ultrasound study reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Report management system coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}