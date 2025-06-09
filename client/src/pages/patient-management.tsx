import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Edit, Eye, Calendar, Phone, Mail, MapPin, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PatientManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId?.toString() || "1");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    pathway: "self",
    referralProviderId: null as number | null
  });

  const [editPatient, setEditPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    pathway: "self",
    referralProviderId: null as number | null
  });

  const [scheduleData, setScheduleData] = useState({
    testId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients", selectedBranch],
    enabled: !!selectedBranch,
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches", user?.tenantId],
    enabled: !!user?.tenantId,
  });

  // Fetch referral providers
  const { data: referralProviders = [] } = useQuery({
    queryKey: ["/api/referral-providers", user?.tenantId],
    enabled: !!user?.tenantId,
  });

  // Add patient mutation
  const addPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await apiRequest("POST", "/api/patients", {
        ...patientData,
        tenantId: user?.tenantId,
        branchId: parseInt(selectedBranch),
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString() : null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setIsAddDialogOpen(false);
      setNewPatient({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        pathway: "self",
        referralProviderId: null
      });
      toast({
        title: "Patient Added",
        description: "New patient has been successfully registered.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit patient mutation
  const editPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await apiRequest("PUT", `/api/patients/${selectedPatient.id}`, {
        ...patientData,
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString() : null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsEditDialogOpen(false);
      setSelectedPatient(null);
      toast({
        title: "Patient Updated",
        description: "Patient information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Schedule appointment mutation
  const scheduleAppointmentMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await apiRequest("POST", "/api/patient-tests", {
        patientId: selectedPatient.id,
        testId: parseInt(scheduleData.testId),
        tenantId: user?.tenantId,
        branchId: parseInt(selectedBranch),
        scheduledAt: `${scheduleData.appointmentDate}T${scheduleData.appointmentTime}:00`,
        notes: scheduleData.notes,
        status: "scheduled"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient-tests"] });
      setIsScheduleDialogOpen(false);
      setSelectedPatient(null);
      setScheduleData({
        testId: "",
        appointmentDate: "",
        appointmentTime: "",
        notes: ""
      });
      toast({
        title: "Appointment Scheduled",
        description: "Test appointment has been successfully scheduled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch available tests for scheduling
  const { data: availableTests = [] } = useQuery({
    queryKey: ["/api/tests"],
    enabled: isScheduleDialogOpen,
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    addPatientMutation.mutate(newPatient);
  };

  const handleEditPatient = (e: React.FormEvent) => {
    e.preventDefault();
    editPatientMutation.mutate(editPatient);
  };

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleAppointmentMutation.mutate(scheduleData);
  };

  const openViewDialog = (patient: any) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (patient: any) => {
    setSelectedPatient(patient);
    setEditPatient({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
      gender: patient.gender || "",
      address: patient.address || "",
      pathway: patient.pathway || "self",
      referralProviderId: patient.referralProviderId || null
    });
    setIsEditDialogOpen(true);
  };

  const openScheduleDialog = (patient: any) => {
    setSelectedPatient(patient);
    setIsScheduleDialogOpen(true);
  };

  const filteredPatients = patients.filter((patient: any) =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getPathwayBadge = (pathway: string) => {
    return pathway === "self" ? (
      <Badge variant="default" className="bg-medical-blue">Self-Pay</Badge>
    ) : (
      <Badge variant="default" className="bg-medical-green">Referral</Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-slate-gray">Manage patient records and appointments</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-blue-700">
              <UserPlus className="mr-2 w-4 h-4" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pathway">Payment Pathway</Label>
                  <Select value={newPatient.pathway} onValueChange={(value) => setNewPatient({ ...newPatient, pathway: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self-Pay</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newPatient.pathway === "referral" && (
                  <div className="space-y-2">
                    <Label htmlFor="referralProvider">Referral Provider</Label>
                    <Select 
                      value={newPatient.referralProviderId?.toString() || ""} 
                      onValueChange={(value) => setNewPatient({ ...newPatient, referralProviderId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralProviders.map((provider: any) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addPatientMutation.isPending} className="bg-medical-blue hover:bg-blue-700">
                  {addPatientMutation.isPending ? "Adding..." : "Add Patient"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-gray w-4 h-4" />
                <Input
                  placeholder="Search patients by name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patientsLoading ? (
            <div className="p-6 text-center text-slate-gray">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-6 text-center text-slate-gray">
              {searchTerm ? "No patients found matching your search." : "No patients registered yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Pathway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-gray uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient: any) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-slate-gray">
                            ID: {patient.patientId}
                          </div>
                          {patient.dateOfBirth && (
                            <div className="text-sm text-slate-gray">
                              Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-3 h-3 mr-1" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center text-sm text-slate-gray">
                              <Mail className="w-3 h-3 mr-1" />
                              {patient.email}
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center text-sm text-slate-gray">
                              <MapPin className="w-3 h-3 mr-1" />
                              {patient.address.substring(0, 30)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPathwayBadge(patient.pathway)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-gray">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-medical-blue hover:text-blue-700" 
                          title="View Patient"
                          onClick={() => openViewDialog(patient)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-gray hover:text-gray-700" 
                          title="Edit Patient"
                          onClick={() => openEditDialog(patient)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-medical-green hover:text-green-700" 
                          title="Schedule Appointment"
                          onClick={() => openScheduleDialog(patient)}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:text-purple-700" 
                          title="Generate Report"
                          onClick={() => window.open(`/report-designer?patientId=${patient.id}`, '_blank')}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-sm font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Patient ID</Label>
                  <p className="text-sm">{selectedPatient.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedPatient.email || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Gender</Label>
                  <p className="text-sm">{selectedPatient.gender || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                  <p className="text-sm">
                    {selectedPatient.dateOfBirth 
                      ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                      : "Not provided"
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Address</Label>
                <p className="text-sm">{selectedPatient.address || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Pathway</Label>
                <div className="mt-1">{getPathwayBadge(selectedPatient.pathway)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                <p className="text-sm">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editPatient.firstName}
                  onChange={(e) => setEditPatient({ ...editPatient, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editPatient.lastName}
                  onChange={(e) => setEditPatient({ ...editPatient, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editPatient.email}
                  onChange={(e) => setEditPatient({ ...editPatient, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editPatient.phone}
                  onChange={(e) => setEditPatient({ ...editPatient, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDateOfBirth">Date of Birth</Label>
                <Input
                  id="editDateOfBirth"
                  type="date"
                  value={editPatient.dateOfBirth}
                  onChange={(e) => setEditPatient({ ...editPatient, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGender">Gender</Label>
                <Select value={editPatient.gender} onValueChange={(value) => setEditPatient({ ...editPatient, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address</Label>
              <Input
                id="editAddress"
                value={editPatient.address}
                onChange={(e) => setEditPatient({ ...editPatient, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPathway">Patient Pathway</Label>
              <Select value={editPatient.pathway} onValueChange={(value) => setEditPatient({ ...editPatient, pathway: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self-Pay</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editPatient.pathway === "referral" && (
              <div className="space-y-2">
                <Label htmlFor="editReferralProvider">Referral Provider</Label>
                <Select 
                  value={editPatient.referralProviderId?.toString() || ""} 
                  onValueChange={(value) => setEditPatient({ ...editPatient, referralProviderId: value ? parseInt(value) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {(referralProviders as any[]).map((provider: any) => (
                      <SelectItem key={provider.id} value={provider.id.toString()}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editPatientMutation.isPending}>
                {editPatientMutation.isPending ? "Updating..." : "Update Patient"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Test Appointment</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Patient: {selectedPatient.firstName} {selectedPatient.lastName}</p>
              <p className="text-sm text-gray-600">ID: {selectedPatient.patientId}</p>
            </div>
          )}
          <form onSubmit={handleScheduleAppointment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testId">Select Test</Label>
              <Select value={scheduleData.testId} onValueChange={(value) => setScheduleData({ ...scheduleData, testId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  {(availableTests as any[]).map((test: any) => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      {test.name} - ₦{test.price?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Appointment Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={scheduleData.appointmentDate}
                  onChange={(e) => setScheduleData({ ...scheduleData, appointmentDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Appointment Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={scheduleData.appointmentTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, appointmentTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleNotes">Notes (Optional)</Label>
              <Input
                id="scheduleNotes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                placeholder="Any special instructions or notes"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleAppointmentMutation.isPending}>
                {scheduleAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}